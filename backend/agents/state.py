from typing import TypedDict, Optional


class DebateState(TypedDict):
    # Session context (set once at start)
    session_id: str
    topic: str
    mode: str                        # "user_vs_ai" | "ai_vs_ai"
    total_rounds: int
    user_position: Optional[str]     # "for" | "against" | None (ai_vs_ai)

    # Round tracking
    current_round: int               # 1-indexed
    current_round_id: str

    # Arguments for the current round
    argument_for: Optional[str]
    argument_against: Optional[str]

    # History of all completed rounds
    # Each entry: {"round": int, "for": str, "against": str}
    history: list[dict]

    # Cumulative scores
    cumulative_score_for: float
    cumulative_score_against: float

    # Current round scores (from judge)
    round_score_for: Optional[dict]
    round_score_against: Optional[dict]

    # Control flow
    awaiting_user_input: bool
    is_complete: bool

