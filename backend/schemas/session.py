from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
import uuid


class SessionCreate(BaseModel):
    topic: str
    mode: str  # "user_vs_ai" | "ai_vs_ai"
    user_position: Optional[str] = None  # "for" | "against" | None
    total_rounds: int = 3

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v):
        if v not in ("user_vs_ai", "ai_vs_ai"):
            raise ValueError("mode must be 'user_vs_ai' or 'ai_vs_ai'")
        return v

    @field_validator("user_position")
    @classmethod
    def validate_position(cls, v):
        if v is not None and v not in ("for", "against"):
            raise ValueError("user_position must be 'for', 'against', or null")
        return v

    @field_validator("total_rounds")
    @classmethod
    def validate_rounds(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("total_rounds must be between 1 and 5")
        return v


class SessionRead(BaseModel):
    id: uuid.UUID
    mode: str
    topic: str
    user_position: Optional[str]
    total_rounds: int
    current_round: int
    status: str
    winner: Optional[str]
    final_score_for: Optional[float]
    final_score_against: Optional[float]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
