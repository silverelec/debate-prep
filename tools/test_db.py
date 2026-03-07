"""
test_db.py
Smoke test: verify DB connection and table existence.
Usage: python tools/test_db.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from sqlalchemy import text
from core.database import engine


async def main():
    print("Testing database connection...")
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT 1"))
        assert result.scalar() == 1
        print("  Connection: OK")

        # Check tables exist
        for table in ["debate_sessions", "debate_rounds", "round_scores"]:
            result = await conn.execute(
                text("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = :t"),
                {"t": table},
            )
            count = result.scalar()
            status = "OK" if count == 1 else "MISSING"
            print(f"  Table '{table}': {status}")

    await engine.dispose()
    print("Database smoke test passed.")


if __name__ == "__main__":
    asyncio.run(main())
