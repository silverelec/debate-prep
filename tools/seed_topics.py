"""
seed_topics.py
Seeds sample debate topics into a JSON file (used by /api/topics endpoint).
Usage: python tools/seed_topics.py
"""
import json
import os

TOPICS = [
    {"id": "1", "title": "Artificial intelligence will do more harm than good to society", "category": "Technology", "difficulty": "intermediate"},
    {"id": "2", "title": "Universal basic income should be implemented globally", "category": "Economics", "difficulty": "intermediate"},
    {"id": "3", "title": "Social media platforms should be regulated like public utilities", "category": "Policy", "difficulty": "beginner"},
    {"id": "4", "title": "Nuclear energy is essential for addressing climate change", "category": "Environment", "difficulty": "intermediate"},
    {"id": "5", "title": "Remote work is better than in-office work for productivity", "category": "Work", "difficulty": "beginner"},
    {"id": "6", "title": "Genetic engineering of humans should be permitted", "category": "Ethics", "difficulty": "advanced"},
    {"id": "7", "title": "Cryptocurrency will replace traditional banking", "category": "Finance", "difficulty": "intermediate"},
    {"id": "8", "title": "The death penalty should be abolished worldwide", "category": "Justice", "difficulty": "beginner"},
    {"id": "9", "title": "Space exploration should be privatized", "category": "Science", "difficulty": "intermediate"},
    {"id": "10", "title": "Compulsory voting should be introduced in democracies", "category": "Politics", "difficulty": "advanced"},
    {"id": "11", "title": "Animal testing for medical research should be banned", "category": "Ethics", "difficulty": "beginner"},
    {"id": "12", "title": "Automation will create more jobs than it destroys", "category": "Economics", "difficulty": "advanced"},
]

output_path = os.path.join(os.path.dirname(__file__), "..", ".tmp", "topics.json")
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w") as f:
    json.dump(TOPICS, f, indent=2)

print(f"Seeded {len(TOPICS)} topics to {output_path}")
