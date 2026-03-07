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
import json
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from agents.graph import compiled_graph
from agents.state import DebateState
from services.debate_service import get_session, mark_session_in_progress

router = APIRouter(tags=["websocket"])


def build_initial_state(session, callback) -> DebateState:
    return DebateState(
        session_id=str(session.id),
        topic=session.topic,
        mode=session.mode,
        total_rounds=session.total_rounds,
        user_position=session.user_position,
        current_round=0,
        current_round_id="",
        argument_for=None,
        argument_against=None,
        history=[],
        cumulative_score_for=0.0,
        cumulative_score_against=0.0,
        round_score_for=None,
        round_score_against=None,
        awaiting_user_input=False,
        user_argument=None,
        is_complete=False,
        stream_callback=callback,
    )


@router.websocket("/ws/debate/{session_id}")
async def debate_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()

    # Load session
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

    # Build async stream_callback that pushes events over the WebSocket
    async def stream_callback(event_type: str, data: str):
        try:
            await websocket.send_json({
                "type": event_type,
                "data": data,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
        except Exception:
            pass  # WebSocket may be closed; ignore send errors

    config = {"configurable": {"thread_id": session_id}}
    initial_state = build_initial_state(session, stream_callback)

    try:
        if session.mode == "ai_vs_ai":
            await _run_ai_vs_ai(websocket, initial_state, config, stream_callback)
        else:
            await _run_user_vs_ai(websocket, session, initial_state, config, stream_callback)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "data": str(e)})
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


async def _run_ai_vs_ai(websocket, initial_state, config, stream_callback):
    """Run full AI vs AI debate to completion."""
    async for _ in compiled_graph.astream(initial_state, config=config, stream_mode="updates"):
        pass  # All streaming happens via stream_callback inside nodes


async def _run_user_vs_ai(websocket, session, initial_state, config, stream_callback):
    """
    Interleave graph execution with user input via WebSocket.
    Graph pauses at human_argument node (interrupt_before), waits for user input,
    then resumes.
    """
    # Run graph until first interrupt (user's first turn)
    async for _ in compiled_graph.astream(initial_state, config=config, stream_mode="updates"):
        pass

    while True:
        # Check if debate is already complete
        graph_state = await compiled_graph.aget_state(config)
        if graph_state.values.get("is_complete"):
            break

        # Check if we're actually interrupted (waiting for human input)
        # If not interrupted, the loop should naturally end
        if not graph_state.next:
            break

        # Signal frontend: user's turn to input
        await websocket.send_json({
            "type": "user_turn",
            "data": json.dumps({
                "round": graph_state.values.get("current_round"),
                "position": session.user_position,
            }),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        # Wait for user's argument message
        try:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
        except Exception as e:
            await websocket.send_json({"type": "error", "data": f"Invalid message: {e}"})
            continue

        if msg.get("type") != "user_argument":
            await websocket.send_json({"type": "error", "data": "Expected user_argument message"})
            continue

        user_text = msg.get("data", "").strip()
        if not user_text:
            await websocket.send_json({"type": "error", "data": "Argument cannot be empty"})
            continue

        # Inject user argument into the graph state and resume
        await compiled_graph.aupdate_state(
            config,
            {"user_argument": user_text, "stream_callback": stream_callback},
            as_node="human_argument",
        )

        async for _ in compiled_graph.astream(None, config=config, stream_mode="updates"):
            pass

        # Check completion after this round
        graph_state = await compiled_graph.aget_state(config)
        if graph_state.values.get("is_complete"):
            break
