import json
import os
from fastapi import APIRouter

router = APIRouter(prefix="/api/topics", tags=["topics"])

TOPICS_FILE = os.path.join(os.path.dirname(__file__), "..", "..", ".tmp", "topics.json")


def load_topics() -> list[dict]:
    if os.path.exists(TOPICS_FILE):
        with open(TOPICS_FILE) as f:
            return json.load(f)
    return []


@router.get("")
async def list_topics(category: str | None = None, difficulty: str | None = None):
    topics = load_topics()
    if category:
        topics = [t for t in topics if t.get("category", "").lower() == category.lower()]
    if difficulty:
        topics = [t for t in topics if t.get("difficulty", "").lower() == difficulty.lower()]
    return topics
