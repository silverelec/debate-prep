"""
debate_service.py
Handles session lifecycle: creation, round persistence, finalization.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from models import DebateSession, DebateRound, RoundScore
from core.database import AsyncSessionLocal


def calculate_weighted_total(scores: dict) -> float:
    return (
        scores["argument_quality"] * 0.40
        + scores["responsiveness"] * 0.30
        + scores["impact_analysis"] * 0.20
        + scores["debate_skill"] * 0.10
    )


async def create_session(
    *,
    topic: str,
    mode: str,
    user_position: str | None,
    total_rounds: int,
) -> DebateSession:
    async with AsyncSessionLocal() as db:
        session = DebateSession(
            topic=topic,
            mode=mode,
            user_position=user_position,
            total_rounds=total_rounds,
            status="pending",
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        return session


async def get_session(session_id: str) -> DebateSession | None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(DebateSession).where(DebateSession.id == uuid.UUID(session_id))
        )
        return result.scalar_one_or_none()


async def mark_session_in_progress(session_id: str):
    async with AsyncSessionLocal() as db:
        await db.execute(
            update(DebateSession)
            .where(DebateSession.id == uuid.UUID(session_id))
            .values(status="in_progress", updated_at=datetime.now(timezone.utc))
        )
        await db.commit()


async def persist_round(state: dict) -> uuid.UUID:
    """Write completed round arguments and scores to DB. Returns round_id."""
    async with AsyncSessionLocal() as db:
        # Upsert round record
        result = await db.execute(
            select(DebateRound).where(
                DebateRound.session_id == uuid.UUID(state["session_id"]),
                DebateRound.round_number == state["current_round"],
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            round_obj = existing
            round_obj.argument_for = state.get("argument_for")
            round_obj.argument_against = state.get("argument_against")
            round_obj.argument_for_at = datetime.now(timezone.utc)
            round_obj.argument_against_at = datetime.now(timezone.utc)
            round_obj.status = "complete"
        else:
            round_obj = DebateRound(
                session_id=uuid.UUID(state["session_id"]),
                round_number=state["current_round"],
                argument_for=state.get("argument_for"),
                argument_against=state.get("argument_against"),
                argument_for_at=datetime.now(timezone.utc),
                argument_against_at=datetime.now(timezone.utc),
                status="complete",
            )
            db.add(round_obj)

        await db.flush()  # Get round_obj.id

        # Persist scores
        for pos, score_key in [("for", "round_score_for"), ("against", "round_score_against")]:
            scores = state.get(score_key)
            if not scores:
                continue

            # Remove old score if exists
            existing_score = await db.execute(
                select(RoundScore).where(
                    RoundScore.round_id == round_obj.id,
                    RoundScore.scored_position == pos,
                )
            )
            old = existing_score.scalar_one_or_none()
            if old:
                await db.delete(old)

            weighted = calculate_weighted_total(scores)
            cumulative = (
                state["cumulative_score_for"] if pos == "for"
                else state["cumulative_score_against"]
            )

            score_obj = RoundScore(
                round_id=round_obj.id,
                session_id=uuid.UUID(state["session_id"]),
                scored_position=pos,
                argument_quality=scores["argument_quality"],
                responsiveness=scores["responsiveness"],
                impact_analysis=scores["impact_analysis"],
                debate_skill=scores["debate_skill"],
                weighted_total=weighted,
                feedback=scores.get("feedback", ""),
                cumulative_score=cumulative,
            )
            db.add(score_obj)

        # Update session current_round
        await db.execute(
            update(DebateSession)
            .where(DebateSession.id == uuid.UUID(state["session_id"]))
            .values(current_round=state["current_round"], updated_at=datetime.now(timezone.utc))
        )

        await db.commit()
        return round_obj.id


async def finalize_session(
    session_id: str,
    winner: str,
    final_score_for: float,
    final_score_against: float,
):
    async with AsyncSessionLocal() as db:
        await db.execute(
            update(DebateSession)
            .where(DebateSession.id == uuid.UUID(session_id))
            .values(
                status="completed",
                winner=winner,
                final_score_for=final_score_for,
                final_score_against=final_score_against,
                updated_at=datetime.now(timezone.utc),
            )
        )
        await db.commit()
