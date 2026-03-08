import anthropic
from .state import DebateState
from .prompts import AGAINST_SYSTEM_PROMPT, build_opponent_context
from . import callback_registry
from core.config import get_settings


async def against_agent_node(state: DebateState) -> dict:
    """Streams the AGAINST argument token by token, returns state update."""
    settings = get_settings()
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    callback = callback_registry.get(state["session_id"])

    opponent_context = build_opponent_context(state["history"], side="against")
    system_prompt = AGAINST_SYSTEM_PROMPT.format(
        topic=state["topic"],
        current_round=state["current_round"],
        total_rounds=state["total_rounds"],
        opponent_context=opponent_context,
    )

    full_text = ""

    async with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=settings.max_argument_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": "Present your argument."}],
    ) as stream:
        async for text in stream.text_stream:
            full_text += text
            if callback:
                await callback("token_against", text)

    if callback:
        await callback("argument_against_complete", "")

    return {"argument_against": full_text}
