from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class User(Document):
    email: str
    hashed_password: str
    full_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"

class AnalysisHistory(Document):
    user_id: str
    original_text: str
    is_toxic: bool
    analysis_tier: str  # <-- NEW FIELD ADDED
    toxicity_scores: Dict[str, float]
    lime_explanation: List[Dict[str, Any]]
    sentiment: str
    rewritten_text: Optional[str] = None
    suggestion: Optional[str] = None
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "analysis_history"

class Token(BaseModel):
    access_token: str
    token_type: str