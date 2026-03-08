"""
In-memory registry mapping session_id -> stream_callback.
Keeps callable objects out of LangGraph state (which must be serializable).
"""
_callbacks: dict = {}


def register(session_id: str, callback) -> None:
    _callbacks[session_id] = callback


def get(session_id: str):
    return _callbacks.get(session_id)


def unregister(session_id: str) -> None:
    _callbacks.pop(session_id, None)
