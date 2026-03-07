from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from .state import DebateState
from .for_agent import for_agent_node
from .against_agent import against_agent_node
from .judge_agent import judge_node


# ---------------------------------------------------------------------------
# Helper nodes
# ---------------------------------------------------------------------------

async def initialize_round_node(state: DebateState) -> dict:
    """Increment round counter, reset per-round fields."""
    return {
        "current_round": state["current_round"] + 1,
        "argument_for": None,
        "argument_against": None,
        "round_score_for": None,
        "round_score_against": None,
        "awaiting_user_input": False,
        "user_argument": None,
        "current_round_id": "",  # Will be set by persist_round after DB insert
    }


async def human_argument_node(state: DebateState) -> dict:
    """
    Placeholder that LangGraph interrupts before (interrupt_before=["human_argument"]).
    When resumed, user_argument has been injected into state.
    Assigns the user's text to the correct side.
    """
    user_arg = state.get("user_argument", "")
    user_pos = state.get("user_position", "for")
    if user_pos == "for":
        return {"argument_for": user_arg, "awaiting_user_input": False}
    else:
        return {"argument_against": user_arg, "awaiting_user_input": False}


async def persist_round_node(state: DebateState) -> dict:
    """Persist completed round data to DB. Imported lazily to avoid circular imports."""
    from services.debate_service import persist_round
    round_id = await persist_round(state)
    return {"current_round_id": str(round_id)}


async def check_completion_node(state: DebateState) -> dict:
    """Update history with completed round."""
    updated_history = list(state["history"]) + [{
        "round": state["current_round"],
        "for": state["argument_for"] or "",
        "against": state["argument_against"] or "",
    }]
    is_complete = state["current_round"] >= state["total_rounds"]
    return {"history": updated_history, "is_complete": is_complete}


async def finalize_debate_node(state: DebateState) -> dict:
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

    callback = state.get("stream_callback")
    if callback:
        import json
        await callback("debate_complete", json.dumps({
            "winner": winner,
            "final_score_for": round(score_for, 2),
            "final_score_against": round(score_against, 2),
        }))

    return {"is_complete": True}


# ---------------------------------------------------------------------------
# Routing functions
# ---------------------------------------------------------------------------

def route_after_initialize(state: DebateState) -> str:
    if state["mode"] == "ai_vs_ai":
        return "ai_for_argument"
    # user_vs_ai
    if state["user_position"] == "for":
        return "human_argument"  # User argues FOR first
    else:
        return "ai_for_argument"  # AI argues FOR, then user argues AGAINST


def route_after_for(state: DebateState) -> str:
    if state["mode"] == "ai_vs_ai":
        return "ai_against_argument"
    # user_vs_ai, user_position == "against"
    return "human_argument"


def route_after_human(state: DebateState) -> str:
    if state["user_position"] == "for":
        return "ai_against_argument"  # User was FOR, now AI argues AGAINST
    else:
        return "judge"  # User was AGAINST (after AI was FOR), now judge


def route_after_check(state: DebateState) -> str:
    if state["is_complete"]:
        return "finalize_debate"
    return "initialize_round"


# ---------------------------------------------------------------------------
# Graph assembly
# ---------------------------------------------------------------------------

def build_graph() -> StateGraph:
    builder = StateGraph(DebateState)

    builder.add_node("initialize_round", initialize_round_node)
    builder.add_node("ai_for_argument", for_agent_node)
    builder.add_node("ai_against_argument", against_agent_node)
    builder.add_node("human_argument", human_argument_node)
    builder.add_node("judge", judge_node)
    builder.add_node("persist_round", persist_round_node)
    builder.add_node("check_completion", check_completion_node)
    builder.add_node("finalize_debate", finalize_debate_node)

    builder.add_edge(START, "initialize_round")

    builder.add_conditional_edges(
        "initialize_round",
        route_after_initialize,
        {"ai_for_argument": "ai_for_argument", "human_argument": "human_argument"},
    )

    builder.add_conditional_edges(
        "ai_for_argument",
        route_after_for,
        {"ai_against_argument": "ai_against_argument", "human_argument": "human_argument"},
    )

    builder.add_edge("ai_against_argument", "judge")

    builder.add_conditional_edges(
        "human_argument",
        route_after_human,
        {"ai_against_argument": "ai_against_argument", "judge": "judge"},
    )

    builder.add_edge("judge", "persist_round")
    builder.add_edge("persist_round", "check_completion")

    builder.add_conditional_edges(
        "check_completion",
        route_after_check,
        {"initialize_round": "initialize_round", "finalize_debate": "finalize_debate"},
    )

    builder.add_edge("finalize_debate", END)

    return builder


# Compile once at import time — shared across all sessions
# interrupt_before=["human_argument"] pauses the graph at the human turn
checkpointer = MemorySaver()
compiled_graph = build_graph().compile(
    checkpointer=checkpointer,
    interrupt_before=["human_argument"],
)
