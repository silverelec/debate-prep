export type DebateMode = "user_vs_ai" | "ai_vs_ai";
export type Position = "for" | "against";
export type SessionStatus = "pending" | "in_progress" | "completed" | "abandoned";
export type Winner = "for" | "against" | "tie";

export interface Session {
  id: string;
  mode: DebateMode;
  topic: string;
  user_position: Position | null;
  total_rounds: number;
  current_round: number;
  status: SessionStatus;
  winner: Winner | null;
  final_score_for: number | null;
  final_score_against: number | null;
  created_at: string;
  updated_at: string;
  rounds?: Round[];
}

export interface Round {
  id: string;
  session_id: string;
  round_number: number;
  argument_for: string | null;
  argument_against: string | null;
  status: string;
  scores?: Score[];
}

export interface Score {
  id: string;
  round_id: string;
  session_id: string;
  scored_position: Position;
  argument_quality: number;
  responsiveness: number;
  impact_analysis: number;
  debate_skill: number;
  weighted_total: number;
  feedback: string;
  cumulative_score: number;
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

// WebSocket event types
export type WsEventType =
  | "token_for"
  | "token_against"
  | "argument_for_complete"
  | "argument_against_complete"
  | "judge_feedback"
  | "judge_scores"
  | "user_turn"
  | "debate_complete"
  | "error";

export interface WsEvent {
  type: WsEventType;
  data: string;
  timestamp: string;
}

export interface JudgeScores {
  round: number;
  score_for: number;
  score_against: number;
  cumulative_for: number;
  cumulative_against: number;
  detail_for: ScoreDetail;
  detail_against: ScoreDetail;
  round_summary: string;
}

export interface ScoreDetail {
  argument_quality: number;
  responsiveness: number;
  impact_analysis: number;
  debate_skill: number;
  feedback: string;
}

export interface DebateComplete {
  winner: Winner;
  final_score_for: number;
  final_score_against: number;
}

export interface CompletedRound {
  round_number: number;
  argument_for: string;
  argument_against: string;
  scores: JudgeScores | null;
  judge_feedback: string;
}
