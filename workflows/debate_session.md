# Workflow: Debate Session

## Objective
Run a complete debate session (User vs AI or AI vs AI) from session creation to final scoring.

## Required Inputs
- `topic`: The debate topic (string)
- `mode`: `"user_vs_ai"` or `"ai_vs_ai"`
- `user_position`: `"for"` or `"against"` (required for user_vs_ai, null otherwise)
- `total_rounds`: Integer 1–5

## Tools Used
- `backend/api/sessions.py` — REST session creation
- `backend/api/ws.py` — WebSocket real-time debate execution
- `backend/agents/graph.py` — LangGraph orchestration
- `backend/services/debate_service.py` — DB persistence

## Session Lifecycle

### 1. Session Creation
- `POST /api/sessions` creates a `DebateSession` record with status `pending`
- Returns `session_id` which the frontend uses to navigate to the debate room

### 2. WebSocket Connection
- Frontend connects to `WS /ws/debate/{session_id}`
- Backend loads the session, marks it `in_progress`
- Backend builds the initial `DebateState` and injects the `stream_callback`

### 3. Graph Execution

#### AI vs AI Mode
1. Graph runs `initialize_round` → `ai_for_argument` → `ai_against_argument` → `judge` → `persist_round` → `check_completion`
2. If `current_round < total_rounds`, loop back to `initialize_round`
3. On completion, `finalize_debate` sets `status=completed`, records winner

#### User vs AI Mode
1. Graph runs until it hits `human_argument` node (interrupt)
2. Backend sends `user_turn` event over WebSocket
3. Frontend shows `UserInputBox`; user submits argument
4. Backend injects `user_argument` into graph state and resumes
5. Graph continues with judge → persist → check → loop or finalize

### 4. Round Scoring
- Judge receives both arguments + full history as context
- Returns JSON with per-criterion scores (0–10)
- Weighted total: Argument Quality (40%) + Responsiveness (30%) + Impact Analysis (20%) + Debate Skill (10%)
- Cumulative scores tracked across rounds
- All data persisted to `round_scores` table

### 5. Session Completion
- `finalize_debate` computes winner (higher cumulative score), persists to DB
- Backend sends `debate_complete` event with winner and final scores
- Frontend shows `WinnerModal`

## Error Handling
- If Anthropic API rate limits, the agent will raise an exception caught in `ws.py`
- `error` event is sent over WebSocket and displayed in frontend
- Sessions left in `in_progress` status if connection drops unexpectedly
- Recovery: reconnect to the same WebSocket endpoint (graph state is preserved in `MemorySaver`)

## Known Constraints
- `MemorySaver` is in-process only — if the backend restarts, in-progress session graph state is lost
- For production: replace `MemorySaver` with `AsyncPostgresSaver` from `langgraph-checkpoint-postgres`
- `stream_callback` is not persisted; it is re-injected on each WebSocket connection
