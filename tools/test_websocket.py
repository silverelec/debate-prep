"""
test_websocket.py
End-to-end smoke test: creates a session, connects via WebSocket, runs a 1-round AI vs AI debate.
Usage: python tools/test_websocket.py
Requirements: backend must be running on localhost:8000
"""
import asyncio
import json
import sys
import os
import urllib.request

try:
    import websockets
except ImportError:
    print("Install websockets: pip install websockets")
    sys.exit(1)

API_BASE = "http://localhost:8000"
WS_BASE = "ws://localhost:8000"


def create_session():
    payload = json.dumps({
        "topic": "Artificial intelligence will do more harm than good",
        "mode": "ai_vs_ai",
        "total_rounds": 1,
    }).encode()
    req = urllib.request.Request(
        f"{API_BASE}/api/sessions",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


async def run_debate(session_id: str):
    uri = f"{WS_BASE}/ws/debate/{session_id}"
    print(f"Connecting to {uri}")
    async with websockets.connect(uri) as ws:
        while True:
            try:
                raw = await asyncio.wait_for(ws.recv(), timeout=120)
            except asyncio.TimeoutError:
                print("Timeout waiting for event")
                break
            msg = json.loads(raw)
            event_type = msg["type"]

            if event_type in ("token_for", "token_against", "judge_feedback"):
                print(msg["data"], end="", flush=True)
            elif event_type == "argument_for_complete":
                print("\n[FOR argument complete]")
            elif event_type == "argument_against_complete":
                print("\n[AGAINST argument complete]")
            elif event_type == "judge_scores":
                scores = json.loads(msg["data"])
                print(f"\n[JUDGE SCORES] FOR: {scores['score_for']:.2f} | AGAINST: {scores['score_against']:.2f}")
            elif event_type == "debate_complete":
                result = json.loads(msg["data"])
                print(f"\n[DEBATE COMPLETE] Winner: {result['winner'].upper()}")
                print(f"  Final FOR: {result['final_score_for']:.2f}")
                print(f"  Final AGAINST: {result['final_score_against']:.2f}")
                break
            elif event_type == "error":
                print(f"\n[ERROR] {msg['data']}")
                break


async def main():
    print("Creating debate session...")
    session = create_session()
    print(f"  Session ID: {session['id']}")
    print(f"  Topic: {session['topic']}\n")
    await run_debate(session["id"])
    print("\nWebSocket smoke test passed.")


if __name__ == "__main__":
    asyncio.run(main())
