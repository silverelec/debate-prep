import sys
import os

# Ensure backend/ directory is in Python path for absolute imports
sys.path.insert(0, os.path.dirname(__file__))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from api.sessions import router as sessions_router
from api.topics import router as topics_router
from api.ws import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Nothing to initialize at startup (graph compiled at import time)
    yield


settings = get_settings()

app = FastAPI(
    title="Debate Prep API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions_router)
app.include_router(topics_router)
app.include_router(ws_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=settings.backend_reload,
    )
