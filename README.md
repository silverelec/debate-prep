# Debate Prep

An agentic debate practice app powered by Claude and LangGraph. Practice your argumentation against an AI opponent, or watch two AIs debate each other with a judge agent scoring every round.

## How It Works

A **LangGraph** state machine orchestrates three Claude-powered agents:

- **For Agent** : argues in favor of the topic
- **Against Agent** : argues against the topic
- **Judge Agent** : scores each round across four criteria: Argument Quality (40%), Responsiveness (30%), Impact Analysis (20%), and Debate Skill (10%)

Two modes are supported:

| Mode | Description |
|---|---|
| `user_vs_ai` | You take a side and argue against the AI. The graph pauses at each round for your input via WebSocket. |
| `ai_vs_ai` | Watch two AI agents debate autonomously, with live streaming to the frontend. |

## Tech Stack

**Backend**
- FastAPI + WebSockets (real-time streaming)
- LangGraph for agent orchestration
- Anthropic Claude (claude-3-5-sonnet) for all agents
- SQLAlchemy (async) + PostgreSQL for session persistence
- Alembic for migrations

**Frontend**
- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- WebSocket client with live argument streaming

## Project Structure

```
backend/
  agents/         # LangGraph graph, For/Against/Judge agents, shared state
  api/            # REST endpoints (sessions, topics) + WebSocket handler
  core/           # Config, DB connection, dependencies
  models/         # SQLAlchemy ORM models
  schemas/        # Pydantic request/response schemas
  services/       # Debate session business logic
frontend/
  app/            # Next.js pages (setup, debate room, history)
  components/     # UI components (ArgumentCard, ScorePanel, WinnerModal, etc.)
  hooks/          # useDebateSocket — WebSocket state management
  lib/            # API client, types, utils
tools/            # Dev scripts (init_db, seed_topics, test_websocket, etc.)
workflows/        # SOPs describing system behavior and agent prompting strategy
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Anthropic API key

### 1. Clone and configure

```bash
git clone https://github.com/silverelec/debate-prep.git
cd debate-prep
cp .env.example .env
# Fill in ANTHROPIC_API_KEY and DATABASE_URL in .env
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Initialize the database
python ../tools/init_db.py

# (Optional) Seed sample debate topics
python ../tools/seed_topics.py

# Start the server
uvicorn main:app --reload
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

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `DATABASE_URL` | PostgreSQL connection string (asyncpg format) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (default: `http://localhost:3000`) |
| `DEFAULT_TOTAL_ROUNDS` | Default number of debate rounds (default: `3`) |
| `MAX_ARGUMENT_TOKENS` | Token limit per agent argument (default: `600`) |
| `MAX_JUDGE_TOKENS` | Token limit for judge scoring (default: `800`) |
| `LANGCHAIN_TRACING_V2` | Enable LangSmith tracing (optional) |

## Session Lifecycle

1. **Setup** — Choose a topic, mode, side, and number of rounds
2. **WebSocket connect** — Frontend connects to `/ws/debate/{session_id}`
3. **Graph execution** — Agents run round by round; arguments stream in real time
4. **Scoring** — Judge scores each round; cumulative scores tracked across rounds
5. **Completion** — Winner determined by final cumulative score; shown in a modal

In `user_vs_ai` mode, the graph pauses at the `human_argument` node and sends a `user_turn` event over WebSocket, waiting for your submission before continuing.

## Known Constraints

- Graph state is held in-memory (`MemorySaver`). If the backend restarts, in-progress sessions cannot be resumed. For production, replace with `AsyncPostgresSaver` from `langgraph-checkpoint-postgres`.
- Sessions left `in_progress` on unexpected disconnects can be rejoined by reconnecting to the same WebSocket URL.
