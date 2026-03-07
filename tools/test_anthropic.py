"""
test_anthropic.py
Smoke test: verify Anthropic API key works.
Usage: python tools/test_anthropic.py
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

import anthropic


def main():
    print("Testing Anthropic API connection...")
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=64,
        messages=[{"role": "user", "content": "Say 'API test successful' and nothing else."}],
    )
    text = response.content[0].text
    print(f"  Claude response: {text}")
    print("Anthropic smoke test passed.")


if __name__ == "__main__":
    main()
