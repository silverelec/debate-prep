"""
init_db.py
Creates all database tables. Run once on fresh install.
Usage: python tools/init_db.py
"""
import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from core.database import engine, Base
import models  # noqa: F401 — imports register all ORM classes with Base


async def main():
    print("Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Done. Tables created:")
    for table in Base.metadata.tables:
        print(f"  - {table}")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
