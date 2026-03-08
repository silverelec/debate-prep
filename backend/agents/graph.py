import json
from .state import DebateState
from .for_agent import for_agent_node
from .against_agent import against_agent_node
from .judge_agent import judge_node
from . import callback_registry, input_registry


# ---------------------------------------------------------------------------
# Helper nodes
# ---------------------------------------------------------------------------

async def initialize_round_node(state: dict) -> dict:
    """Increment round counter, reset per-round fields."""
    return {
        "current_round": state["current_round"] + 1,
        "argument_for": None,
        "argument_against": None,
        "round_score_for": None,
        "round_score_against": None,
        "awaiting_user_input": False,
        "current_round_id": "",
    }


async def human_argument_node(state: dict) -> dict:
    """
    Signals the frontend it's the user's turn, then waits for the user's
    argument to arrive via the input_registry queue (injected from WebSocket).
    """
    session_id = state["session_id"]

    callback = callback_registry.get(session_id)
    if callback:
        await callback("user_turn", json.dumps({
            "round": state["current_round"],
            "position": state["user_position"],
        }))

    queue = input_registry.get(session_id)
    user_text = await queue.get()

    if state["user_position"] == "for":
        return {"argument_for": user_text, "awaiting_user_input": False}
    else:
        return {"argument_against": user_text, "awaiting_user_input": False}


async def persist_round_node(state: dict) -> dict:
    """Persist completed round data to DB."""
    from services.debate_service import persist_round
    round_id = await persist_round(state)
    return {"current_round_id": str(round_id)}


async def check_completion_node(state: dict) -> dict:
    """Update history with completed round and check if debate is done."""
    updated_history = list(state["history"]) + [{
        "round": state["current_round"],
        "for": state["argument_for"] or "",
        "against": state["argument_against"] or "",
    }]
    is_complete = state["current_round"] >= state["total_rounds"]
    return {"history": updated_history, "is_complete": is_complete}


async def finalize_debate_node(state: dict) -> dict:
    """Determine winner and persist final session state."""
    from services.debate_service import finalize_session

    score_for = state["cumulative_score_for"]
    score_against = state["cumulative_score_against"]

    if score_for > score_against:
        winner = "for"
    elif score_against > score_for:
        winner = "against"
    else:
        winner = "tie"

    await finalize_session(
        session_id=state["session_id"],
        winner=winner,
        final_score_for=round(score_for, 2),
        final_score_against=round(score_against, 2),
    )

    callback = callback_registry.get(state["session_id"])
    if callback:
        await callback("debate_complete", json.dumps({
            "winner": winner,
            "final_score_for": round(score_for, 2),
            "final_score_against": round(score_against, 2),
        }))

    return {"is_complete": True}


# ---------------------------------------------------------------------------
# Main debate runner — calls node functions directly, no LangGraph executor
# ---------------------------------------------------------------------------

async def run_debate(state: dict) -> None:
    """
    Execute a full debate by calling node functions directly.
    Avoids LangGraph's execution engine and its internal msgpack serialization,
    which was raising "Object of type function is not serializable".
    All real-time streaming goes through callback_registry, not LangGraph streaming.
    """
    while True:
        state.update(await initialize_round_node(state))

        if state["mode"] == "ai_vs_ai":
            state.update(await for_agent_node(state))
            state.update(await against_agent_node(state))
        elif state["user_position"] == "for":
            state.update(await human_argument_node(state))   # signals UI, awaits queue
            state.update(await against_agent_node(state))
        else:  # user_position == "against"
            state.update(await for_agent_node(state))
            state.update(await human_argument_node(state))   # signals UI, awaits queue

        state.update(await judge_node(state))
        state.update(await persist_round_node(state))
        state.update(await check_completion_node(state))

        if state["is_complete"]:
            break

    await finalize_debate_node(state)
