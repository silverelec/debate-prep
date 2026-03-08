import anthropic
import json
from .state import DebateState
from .prompts import JUDGE_SYSTEM_PROMPT, build_history_context
from . import callback_registry
from core.config import get_settings


def calculate_weighted_total(scores: dict) -> float:
    """Compute weighted score: quality(40%) + responsiveness(30%) + impact(20%) + skill(10%)."""
    return (
        scores["argument_quality"] * 0.40
        + scores["responsiveness"] * 0.30
        + scores["impact_analysis"] * 0.20
        + scores["debate_skill"] * 0.10
    )


async def judge_node(state: DebateState) -> dict:
    """Calls Claude to score both debaters, streams feedback, returns state update."""
    settings = get_settings()
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    callback = callback_registry.get(state["session_id"])

    history_context = build_history_context(state["history"])
    system_prompt = JUDGE_SYSTEM_PROMPT.format(
        topic=state["topic"],
        current_round=state["current_round"],
        argument_for=state["argument_for"] or "",
        argument_against=state["argument_against"] or "",
        history_context=history_context,
    )

    # Stream judge response (which is JSON, but we still want streaming feedback)
    full_text = ""
    async with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=settings.max_judge_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": "Evaluate this round and return your scores as JSON."}],
    ) as stream:
        async for text in stream.text_stream:
            full_text += text
            if callback:
                await callback("judge_feedback", text)

    # Parse the JSON scores
    try:
        # Strip any accidental markdown code fences
        clean = full_text.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        result = json.loads(clean.strip())
    except json.JSONDecodeError as e:
        # Fallback: default scores if parsing fails
        result = {
            "for": {"argument_quality": 5.0, "responsiveness": 5.0, "impact_analysis": 5.0, "debate_skill": 5.0, "feedback": "Unable to parse scores."},
            "against": {"argument_quality": 5.0, "responsiveness": 5.0, "impact_analysis": 5.0, "debate_skill": 5.0, "feedback": "Unable to parse scores."},
            "round_summary": f"Scoring error: {e}",
        }

    score_for = calculate_weighted_total(result["for"])
    score_against = calculate_weighted_total(result["against"])

    new_cumulative_for = state["cumulative_score_for"] + score_for
    new_cumulative_against = state["cumulative_score_against"] + score_against

    scores_payload = {
        "round": state["current_round"],
        "score_for": round(score_for, 2),
        "score_against": round(score_against, 2),
        "cumulative_for": round(new_cumulative_for, 2),
        "cumulative_against": round(new_cumulative_against, 2),
        "detail_for": result["for"],
        "detail_against": result["against"],
        "round_winner": result.get("round_winner", "tie"),
        "round_summary": result.get("round_summary", ""),
    }

    if callback:
        await callback("judge_scores", json.dumps(scores_payload))

    return {
        "round_score_for": result["for"],
        "round_score_against": result["against"],
        "cumulative_score_for": new_cumulative_for,
        "cumulative_score_against": new_cumulative_against,
    }
