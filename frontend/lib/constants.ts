export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8000";

export const SCORE_WEIGHTS = {
  argument_quality: 0.4,
  responsiveness: 0.3,
  impact_analysis: 0.2,
  debate_skill: 0.1,
} as const;
