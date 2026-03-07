import { Position, Winner } from "./types";

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function getPositionColor(position: Position): string {
  return position === "for" ? "blue" : "red";
}

export function getPositionLabel(position: Position): string {
  return position === "for" ? "FOR" : "AGAINST";
}

export function getWinnerLabel(winner: Winner): string {
  if (winner === "tie") return "TIE";
  return `${getPositionLabel(winner)} WINS`;
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner": return "text-green-600 bg-green-50";
    case "intermediate": return "text-yellow-600 bg-yellow-50";
    case "advanced": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
