from pydantic import BaseModel
import uuid


class ScoreRead(BaseModel):
    id: uuid.UUID
    round_id: uuid.UUID
    session_id: uuid.UUID
    scored_position: str
    argument_quality: float
    responsiveness: float
    impact_analysis: float
    debate_skill: float
    weighted_total: float
    feedback: str
    cumulative_score: float

    model_config = {"from_attributes": True}
