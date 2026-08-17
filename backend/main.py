from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
import uvicorn
import joblib
import numpy as np

from database import init_db
from models import User, AnalysisHistory, Token
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from services import get_lime_explanation, rewrite_text_constructively, analyze_context_and_sentiment

app = FastAPI(title="SafeSpeak API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ml_model = joblib.load('artifacts/multilabel_toxic_model.pkl')
vectorizer = joblib.load('artifacts/tfidf_vectorizer.pkl')
categories = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']

@app.on_event("startup")
async def startup_event():
    await init_db()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class TextRequest(BaseModel):
    text: str

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )
    await new_user.insert()
    return {"message": "User registered successfully"}

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/analyze")
async def analyze_text(payload: TextRequest, current_user: User = Depends(get_current_user)):
    text = payload.text
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    vec = vectorizer.transform([text])
    probs = ml_model.predict_proba(vec)
    preds = ml_model.predict(vec)[0]
    
    scores = {}
    for idx, cat in enumerate(categories):
        try:
            cat_prob = probs[idx][0][1]
        except (IndexError, TypeError):
            cat_prob = probs[0][idx]
        scores[cat] = round(float(cat_prob), 4)

    is_toxic_overall = bool(any(preds))
    lime_exp = get_lime_explanation(text)
    
    sentiment_result = analyze_context_and_sentiment(text)

    analysis_tier = "Safe"
    rewrite_reason = ""

    if is_toxic_overall:
        analysis_tier = "Toxic"
        rewrite_reason = "Toxicity and platform policy violations"
    elif sentiment_result == "Negative_Personal":
        analysis_tier = "Constructive_Feedback"
        rewrite_reason = "Blunt personal criticism requiring a more constructive tone"

    rewritten_data = {"rewritten_text": None, "suggestion": None}
    if analysis_tier in ["Toxic", "Constructive_Feedback"]:
        rewritten_data = rewrite_text_constructively(text, rewrite_reason)

    history_record = AnalysisHistory(
        user_id=str(current_user.id),
        original_text=text,
        is_toxic=is_toxic_overall,
        analysis_tier=analysis_tier,
        toxicity_scores=scores,
        lime_explanation=lime_exp,
        sentiment=sentiment_result,
        rewritten_text=rewritten_data.get("rewritten_text"),
        suggestion=rewritten_data.get("suggestion")
    )
    await history_record.insert()

    return {
        "text": text,
        "is_toxic": is_toxic_overall,
        "analysis_tier": analysis_tier,
        "toxicity_scores": scores,
        "lime_explanation": lime_exp,
        "sentiment": sentiment_result,
        "rewritten_text": rewritten_data.get("rewritten_text"),
        "suggestion": rewritten_data.get("suggestion")
    }

@app.get("/api/history")
async def get_history(current_user: User = Depends(get_current_user)):
    history = await AnalysisHistory.find(
        AnalysisHistory.user_id == str(current_user.id)
    ).sort(-AnalysisHistory.analyzed_at).limit(10).to_list()
    return history

@app.delete("/api/history/{record_id}")
async def delete_history_record(record_id: str, current_user: User = Depends(get_current_user)):
    record = await AnalysisHistory.get(record_id)
    if not record or record.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Record not found")
    await record.delete()
    return {"message": "Record deleted successfully"}

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    raw_items = await AnalysisHistory.get_motor_collection().find(
        {"user_id": str(current_user.id)}
    ).to_list(length=None)
    
    total_analyses = len(raw_items)
    safe_count = sum(1 for i in raw_items if i.get("analysis_tier") == "Safe")
    constructive_count = sum(1 for i in raw_items if i.get("analysis_tier") == "Constructive_Feedback")
    toxic_count = sum(1 for i in raw_items if i.get("analysis_tier") == "Toxic")
    
    return {
        "total_analyses": total_analyses,
        "safe_count": safe_count,
        "constructive_count": constructive_count,
        "toxic_count": toxic_count,
        "recent_activity": [{"date": "Recent", "tier": i.get("analysis_tier", "Safe")} for i in raw_items[:7]]
    }


    