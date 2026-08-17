import os
import json
import joblib
import google.generativeai as genai
from dotenv import load_dotenv
from lime.lime_text import LimeTextExplainer

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def init_gemini():
    models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
    models.sort(key=lambda x: 'flash' not in x.lower())
    
    for name in models:
        try:
            print(f"Testing Gemini model: {name}...")
            test_model = genai.GenerativeModel(name)
            test_model.generate_content("test")
            print(f"Successfully bound to: {name}")
            return test_model
        except Exception:
            continue
            
    raise Exception("No working Gemini models found for this API key.")

model = init_gemini()

ml_model = joblib.load('artifacts/multilabel_toxic_model.pkl')
vectorizer = joblib.load('artifacts/tfidf_vectorizer.pkl')
explainer = LimeTextExplainer(class_names=['Safe', 'Toxic'])

def predict_pipeline(texts):
    vec = vectorizer.transform(texts)
    return ml_model.predict_proba(vec)

def get_lime_explanation(text: str):
    try:
        exp = explainer.explain_instance(text, predict_pipeline, num_features=6)
        return [{"word": word, "weight": weight} for word, weight in exp.as_list()]
    except Exception as e:
        print(f"LIME Error: {e}")
        return []

def analyze_context_and_sentiment(text: str) -> str:
    try:
        prompt = f"""
        Analyze the following text and categorize it into EXACTLY ONE of these four labels:
        1. Positive
        2. Neutral
        3. Negative_Impersonal
        4. Negative_Personal

        You must return ONLY the exact label string.
        
        Text: "{text}"
        """
        response = model.generate_content(prompt)
        sentiment = response.text.strip()
        
        valid_labels = ["Positive", "Neutral", "Negative_Impersonal", "Negative_Personal"]
        return sentiment if sentiment in valid_labels else "Neutral"
    except Exception as e:
        print(f"Gemini Sentiment Error: {e}")
        return "Neutral"

def rewrite_text_constructively(text: str, reason: str):
    try:
        prompt = f"""
        Rewrite the following text to be constructive, polite, and professional. 
        The original text was flagged for: {reason}.
        Provide a brief suggestion/reasoning.
        You must return ONLY a valid JSON object with EXACTLY two keys: "rewritten_text" and "suggestion". Do not include markdown formatting.
        Text: "{text}"
        """
        response = model.generate_content(prompt)
        
        raw_text = response.text.strip()
        if raw_text.startswith("```json"): raw_text = raw_text[7:]
        if raw_text.startswith("```"): raw_text = raw_text[3:]
        if raw_text.endswith("```"): raw_text = raw_text[:-3]
            
        return json.loads(raw_text.strip())
    except Exception as e:
        print(f"Gemini Rewrite Error: {e}")
        return {"rewritten_text": None, "suggestion": None}