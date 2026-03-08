"""
In-memory registry mapping session_id -> asyncio.Queue for user input.
Keeps asyncio primitives out of LangGraph state (which must be serializable).
"""
import asyncio

_input_queues: dict[str, asyncio.Queue] = {}


def register(session_id: str) -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue()
    _input_queues[session_id] = q
    return q


def get(session_id: str) -> asyncio.Queue | None:
    return _input_queues.get(session_id)


def unregister(session_id: str) -> None:
    _input_queues.pop(session_id, None)
