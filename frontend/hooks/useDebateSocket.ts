"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { WS_BASE_URL } from "@/lib/constants";
import {
  WsEvent,
  JudgeScores,
  DebateComplete,
  CompletedRound,
  Position,
} from "@/lib/types";

export interface DebateSocketState {
  // Streaming text for current round (resets each round)
  streamingFor: string;
  streamingAgainst: string;
  streamingJudge: string;

  // Sealed completed rounds
  completedRounds: CompletedRound[];

  // Running cumulative scores
  cumulativeFor: number;
  cumulativeAgainst: number;

  // Control state
  isUserTurn: boolean;
  userTurnRound: number;
  userTurnPosition: Position | null;
  isComplete: boolean;
  result: DebateComplete | null;

  // Connection
  connected: boolean;
  error: string | null;

  // Actions
  submitUserArgument: (text: string) => void;
}

export function useDebateSocket(
  sessionId: string | null
): DebateSocketState {
  const wsRef = useRef<WebSocket | null>(null);

  const [streamingFor, setStreamingFor] = useState("");
  const [streamingAgainst, setStreamingAgainst] = useState("");
  const [streamingJudge, setStreamingJudge] = useState("");
  const [completedRounds, setCompletedRounds] = useState<CompletedRound[]>([]);
  const [cumulativeFor, setCumulativeFor] = useState(0);
  const [cumulativeAgainst, setCumulativeAgainst] = useState(0);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [userTurnRound, setUserTurnRound] = useState(0);
  const [userTurnPosition, setUserTurnPosition] = useState<Position | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<DebateComplete | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track current round's buffered content for sealing into completedRounds
  const currentForRef = useRef("");
  const currentAgainstRef = useRef("");
  const currentJudgeRef = useRef("");
  const currentScoresRef = useRef<JudgeScores | null>(null);
  const currentRoundRef = useRef(0);

  useEffect(() => {
    if (!sessionId) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/debate/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setError("WebSocket connection error");

    ws.onmessage = (event) => {
      let msg: WsEvent;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case "token_for":
          currentForRef.current += msg.data;
          setStreamingFor((p) => p + msg.data);
          break;

        case "token_against":
          currentAgainstRef.current += msg.data;
          setStreamingAgainst((p) => p + msg.data);
          break;

        case "judge_feedback":
          currentJudgeRef.current += msg.data;
          setStreamingJudge((p) => p + msg.data);
          break;

        case "argument_for_complete":
          // FOR argument done; keep streaming state visible until round seals
          break;

        case "argument_against_complete":
          break;

        case "judge_scores": {
          const scores: JudgeScores = JSON.parse(msg.data);
          currentScoresRef.current = scores;
          currentRoundRef.current = scores.round;
          setCumulativeFor(scores.cumulative_for);
          setCumulativeAgainst(scores.cumulative_against);

          // Seal round into completedRounds
          const sealed: CompletedRound = {
            round_number: scores.round,
            argument_for: currentForRef.current,
            argument_against: currentAgainstRef.current,
            scores: scores,
            judge_feedback: currentJudgeRef.current,
          };
          setCompletedRounds((prev) => [...prev, sealed]);

          // Reset streaming buffers for next round
          currentForRef.current = "";
          currentAgainstRef.current = "";
          currentJudgeRef.current = "";
          currentScoresRef.current = null;
          setStreamingFor("");
          setStreamingAgainst("");
          setStreamingJudge("");
          break;
        }

        case "user_turn": {
          let payload: { round?: number; position?: Position } = {};
          try {
            payload = JSON.parse(msg.data);
          } catch {}
          setUserTurnRound(payload.round ?? 0);
          setUserTurnPosition(payload.position ?? null);
          setIsUserTurn(true);
          break;
        }

        case "debate_complete": {
          const res: DebateComplete = JSON.parse(msg.data);
          setResult(res);
          setIsComplete(true);
          break;
        }

        case "error":
          setError(msg.data);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  const submitUserArgument = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "user_argument", data: text }));
    setIsUserTurn(false);
  }, []);

  return {
    streamingFor,
    streamingAgainst,
    streamingJudge,
    completedRounds,
    cumulativeFor,
    cumulativeAgainst,
    isUserTurn,
    userTurnRound,
    userTurnPosition,
    isComplete,
    result,
    connected,
    error,
    submitUserArgument,
  };
}
