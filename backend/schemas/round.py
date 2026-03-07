from pydantic import BaseModel
from typing import Optional
import uuid


class RoundRead(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    round_number: int
    argument_for: Optional[str]
    argument_against: Optional[str]
    status: str

    model_config = {"from_attributes": True}
