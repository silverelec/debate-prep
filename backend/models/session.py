import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Enum as SAEnum, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class DebateSession(Base):
    __tablename__ = "debate_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    mode: Mapped[str] = mapped_column(
        SAEnum("user_vs_ai", "ai_vs_ai", name="debate_mode", native_enum=False), nullable=False
    )
    topic: Mapped[str] = mapped_column(String, nullable=False)
    user_position: Mapped[str | None] = mapped_column(
        SAEnum("for", "against", name="debate_position", native_enum=False), nullable=True
    )
    total_rounds: Mapped[int] = mapped_column(Integer, default=3)
    current_round: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(
        SAEnum("pending", "in_progress", "completed", "abandoned", name="session_status", native_enum=False),
        default="pending",
    )
    winner: Mapped[str | None] = mapped_column(
        SAEnum("for", "against", "tie", name="debate_winner", native_enum=False), nullable=True
    )
    final_score_for: Mapped[float | None] = mapped_column(Float, nullable=True)
    final_score_against: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    rounds: Mapped[list["DebateRound"]] = relationship(
        "DebateRound", back_populates="session", cascade="all, delete-orphan"
    )
