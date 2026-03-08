import uuid
from sqlalchemy import Float, ForeignKey, Enum as SAEnum, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class RoundScore(Base):
    __tablename__ = "round_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    round_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("debate_rounds.id", ondelete="CASCADE"), nullable=False
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("debate_sessions.id", ondelete="CASCADE"), nullable=False
    )
    scored_position: Mapped[str] = mapped_column(
        SAEnum("for", "against", name="scored_position", native_enum=False), nullable=False
    )
    argument_quality: Mapped[float] = mapped_column(Float, nullable=False)
    responsiveness: Mapped[float] = mapped_column(Float, nullable=False)
    impact_analysis: Mapped[float] = mapped_column(Float, nullable=False)
    debate_skill: Mapped[float] = mapped_column(Float, nullable=False)
    weighted_total: Mapped[float] = mapped_column(Float, nullable=False)
    feedback: Mapped[str] = mapped_column(Text, nullable=False)
    cumulative_score: Mapped[float] = mapped_column(Float, nullable=False)

    round: Mapped["DebateRound"] = relationship("DebateRound", back_populates="scores")
