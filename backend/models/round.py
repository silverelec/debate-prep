import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, ForeignKey, Enum as SAEnum, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base


class DebateRound(Base):
    __tablename__ = "debate_rounds"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False
    )
    round_number: Mapped[int] = mapped_column(Integer, nullable=False)
    argument_for: Mapped[str | None] = mapped_column(Text, nullable=True)
    argument_against: Mapped[str | None] = mapped_column(Text, nullable=True)
    argument_for_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    argument_against_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum("pending", "arguing", "judging", "complete", name="round_status"),
        default="pending",
    )

    session: Mapped["DebateSession"] = relationship("DebateSession", back_populates="rounds")
    scores: Mapped[list["RoundScore"]] = relationship(
        "RoundScore", back_populates="round", cascade="all, delete-orphan"
    )
