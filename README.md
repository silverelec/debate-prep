# Debate Prep

An agentic debate practice app powered by Claude Sonnet 4.6. Practice your argumentation against an AI opponent, or watch two AIs debate each other with a judge agent scoring every round.

## How It Works

Three Claude-powered agents run in a coordinated async loop:

- **For Agent** — argues in favor of the topic
- **Against Agent** — argues against the topic
- **Judge Agent** — scores each round across four criteria: Argument Quality (40%), Responsiveness (30%), Impact Analysis (20%), and Debate Skill (10%)

Two modes are supported:

| Mode | Description |
|---|---|
| `user_vs_ai` | You take a side and argue against the AI. The loop pauses each round for your input via WebSocket. |
| `ai_vs_ai` | Watch two AI agents debate autonomously, with live streaming to the frontend. |

Arguments stream token-by-token to the frontend in real time via WebSocket callbacks.

## Tech Stack

**Backend**
- FastAPI + WebSockets (real-time streaming)
- Anthropic Claude (`claude-sonnet-4-6`) for all three agents
- SQLAlchemy 2.0 (async) + SQLite (`aiosqlite`) for session persistence
- Custom agent orchestration with `callback_registry` and `input_registry`

**Frontend**
- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- WebSocket client with live argument streaming

## Project Structure

```
backend/
  agents/         # For/Against/Judge agents, shared state, callback & input registries
  api/            # REST endpoints (sessions, topics) + WebSocket handler
  core/           # Config, DB connection, dependencies
  models/         # SQLAlchemy ORM models (session, round, score)
  schemas/        # Pydantic request/response schemas
  services/       # Debate session business logic
frontend/
  app/            # Next.js pages (home, setup, debate room, history)
  components/     # UI components (ArgumentCard, ScorePanel, WinnerModal, etc.)
  hooks/          # WebSocket state management
  lib/            # API client, types, utils
tools/            # Dev scripts (init_db, seed_topics, test_websocket, etc.)
workflows/        # SOPs describing agent prompting strategy and session lifecycle
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Anthropic API key

### 1. Clone and configure

```bash
git clone https://github.com/silverelec/debate-prep.git
cd debate-prep
cp .env.example .env
# Fill in ANTHROPIC_API_KEY in .env
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Initialize the database (creates debate.db)
python ../tools/init_db.py

# (Optional) Seed sample debate topics
python ../tools/seed_topics.py

# Start the server
python main.py
```

Backend runs at `http://localhost:8000`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | — |
| `DATABASE_URL` | SQLite connection string | `sqlite+aiosqlite:///./debate.db` |
| `BACKEND_HOST` | Host to bind | `0.0.0.0` |
| `BACKEND_PORT` | Port to bind | `8000` |
| `BACKEND_RELOAD` | Enable hot reload | `true` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend → backend REST URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_BASE_URL` | Frontend → backend WebSocket URL | `ws://localhost:8000` |
| `DEFAULT_TOTAL_ROUNDS` | Default number of debate rounds | `3` |
| `MAX_ARGUMENT_TOKENS` | Token limit per agent argument | `600` |
| `MAX_JUDGE_TOKENS` | Token limit for judge scoring | `800` |
| `LANGCHAIN_TRACING_V2` | Enable LangSmith tracing (optional) | `false` |

## Session Lifecycle

1. **Setup** — Choose a topic, mode, side, and number of rounds
2. **WebSocket connect** — Frontend connects to `/ws/debate/{session_id}`
3. **Agent loop** — For/Against agents alternate arguments; tokens stream live to the frontend
4. **Scoring** — Judge scores each round and returns weighted feedback; cumulative scores tracked across rounds
5. **Completion** — Winner determined by final cumulative score and displayed in a modal

In `user_vs_ai` mode, the loop pauses at each human turn and sends a `user_turn` event over WebSocket, waiting for your submission before continuing.

## WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `user_turn` | server → client | Your turn to submit an argument |
| `token_for` | server → client | Streaming token from the For agent |
| `token_against` | server → client | Streaming token from the Against agent |
| `judge_feedback` | server → client | Judge's round commentary |
| `judge_scores` | server → client | Per-criterion scores for the round |
| `debate_complete` | server → client | Final scores and winner |
| `user_argument` | client → server | User submits their argument |

## Known Constraints

- Agent state is held in-memory. If the backend restarts, in-progress sessions cannot be resumed.
- Sessions left `in_progress` on unexpected disconnects can be rejoined by reconnecting to the same WebSocket URL.
