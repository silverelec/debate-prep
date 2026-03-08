"""
ws.py
WebSocket endpoint for real-time debate sessions.

Event protocol (server → client):
  token_for               streaming token for the FOR argument
  token_against           streaming token for the AGAINST argument
  argument_for_complete   FOR argument is fully streamed
  argument_against_complete AGAINST argument is fully streamed
  judge_feedback          streaming token for judge narrative
  judge_scores            JSON payload with round scores
  user_turn               signal frontend to show input box
  debate_complete         JSON payload with final result
  error                   error message string

Event protocol (client → server):
  { "type": "user_argument", "data": "<text>" }
"""
import asyncio
import json
import traceback
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from agents.graph import run_debate
from agents.state import DebateState
from agents import callback_registry, input_registry
from services.debate_service import get_session, mark_session_in_progress

router = APIRouter(tags=["websocket"])


def build_initial_state(session) -> dict:
    return {
        "session_id": str(session.id),
        "topic": session.topic,
        "mode": session.mode,
        "total_rounds": session.total_rounds,
        "user_position": session.user_position,
        "current_round": 0,
        "current_round_id": "",
        "argument_for": None,
        "argument_against": None,
        "history": [],
        "cumulative_score_for": 0.0,
        "cumulative_score_against": 0.0,
        "round_score_for": None,
        "round_score_against": None,
        "awaiting_user_input": False,
        "is_complete": False,
    }


@router.websocket("/ws/debate/{session_id}")
async def debate_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()

    session = await get_session(session_id)
    if not session:
        await websocket.send_json({"type": "error", "data": "Session not found"})
        await websocket.close()
        return

    if session.status not in ("pending", "in_progress"):
        await websocket.send_json({"type": "error", "data": f"Session is {session.status}"})
        await websocket.close()
        return

    await mark_session_in_progress(session_id)

    async def stream_callback(event_type: str, data: str):
        try:
            await websocket.send_json({
                "type": event_type,
                "data": data,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
        except Exception:
            pass

    initial_state = build_initial_state(session)
    callback_registry.register(session_id, stream_callback)

    try:
        if session.mode == "ai_vs_ai":
            await _run_ai_vs_ai(initial_state)
        else:
            await _run_user_vs_ai(websocket, session, initial_state)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"[debate_websocket] ERROR:\n{traceback.format_exc()}")
        try:
            await websocket.send_json({"type": "error", "data": str(e)})
        except Exception:
            pass
    finally:
        callback_registry.unregister(session_id)
        try:
            await websocket.close()
        except Exception:
            pass


async def _run_ai_vs_ai(initial_state: dict):
    """Run full AI vs AI debate to completion."""
    await run_debate(initial_state)


async def _run_user_vs_ai(websocket: WebSocket, session, initial_state: dict):
    """
    Run the debate as a background task while concurrently listening for user
    arguments over the WebSocket. human_argument_node signals the frontend and
    waits on an asyncio.Queue; this handler puts user input into that queue.
    """
    session_id = str(session.id)
    input_queue = input_registry.register(session_id)

    async def run_graph():
        await run_debate(initial_state)

    async def forward_user_input():
        while True:
            try:
                raw = await websocket.receive_text()
                msg = json.loads(raw)
            except WebSocketDisconnect:
                break
            except Exception:
                continue

            if msg.get("type") != "user_argument":
                continue
            user_text = msg.get("data", "").strip()
            if user_text:
                await input_queue.put(user_text)

    graph_task = asyncio.create_task(run_graph())
    input_task = asyncio.create_task(forward_user_input())

    try:
        await graph_task
    finally:
        input_task.cancel()
        input_registry.unregister(session_id)
