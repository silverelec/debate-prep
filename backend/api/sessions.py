from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import uuid

from core.dependencies import get_db
from models import DebateSession, DebateRound, RoundScore
from schemas.session import SessionCreate, SessionRead
from schemas.round import RoundRead
from schemas.score import ScoreRead
from services.debate_service import create_session

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=SessionRead, status_code=201)
async def start_session(body: SessionCreate):
    if body.mode == "user_vs_ai" and not body.user_position:
        raise HTTPException(400, "user_position is required for user_vs_ai mode")
    session = await create_session(
        topic=body.topic,
        mode=body.mode,
        user_position=body.user_position,
        total_rounds=body.total_rounds,
    )
    return session


@router.get("", response_model=list[SessionRead])
async def list_sessions(
    status: str | None = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    q = select(DebateSession).order_by(DebateSession.created_at.desc()).limit(limit).offset(offset)
    if status:
        q = q.where(DebateSession.status == status)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{session_id}", response_model=dict)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    try:
        sid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(400, "Invalid session_id")

    result = await db.execute(
        select(DebateSession)
        .where(DebateSession.id == sid)
        .options(selectinload(DebateSession.rounds).selectinload(DebateRound.scores))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(404, "Session not found")

    session_data = SessionRead.model_validate(session).model_dump()
    rounds_data = []
    for r in sorted(session.rounds, key=lambda x: x.round_number):
        round_dict = RoundRead.model_validate(r).model_dump()
        round_dict["scores"] = [ScoreRead.model_validate(s).model_dump() for s in r.scores]
        rounds_data.append(round_dict)
    session_data["rounds"] = rounds_data
    return session_data


@router.delete("/{session_id}", status_code=204)
async def abandon_session(session_id: str, db: AsyncSession = Depends(get_db)):
    try:
        sid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(400, "Invalid session_id")

    result = await db.execute(select(DebateSession).where(DebateSession.id == sid))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(404, "Session not found")
    session.status = "abandoned"
    await db.commit()
