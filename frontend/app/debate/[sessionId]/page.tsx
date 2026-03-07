"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/api";
import { Session } from "@/lib/types";
import { useDebateSocket } from "@/hooks/useDebateSocket";
import { TopicBanner } from "@/components/debate/TopicBanner";
import { RoundHeader } from "@/components/debate/RoundHeader";
import { ArgumentCard } from "@/components/debate/ArgumentCard";
import { StreamingArgument } from "@/components/debate/StreamingArgument";
import { JudgeFeedback } from "@/components/debate/JudgeFeedback";
import { ScorePanel } from "@/components/debate/ScorePanel";
import { UserInputBox } from "@/components/debate/UserInputBox";
import { WinnerModal } from "@/components/debate/WinnerModal";
import { Spinner } from "@/components/ui/Spinner";

export default function DebateRoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Fetch session metadata
  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId)
      .then(setSession)
      .catch((e) => setLoadError(e.message));
  }, [sessionId]);

  const {
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
    error: wsError,
    submitUserArgument,
  } = useDebateSocket(session ? sessionId : null);

  // Auto-scroll feed as new content arrives
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [completedRounds, streamingFor, streamingAgainst, streamingJudge]);

  if (loadError) {
    return (
      <div className="text-center py-20 text-red-600">
        Error loading session: {loadError}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
        <Spinner />
        <span>Loading session...</span>
      </div>
    );
  }

  // Determine if there's an active streaming round in progress
  const hasActiveStreaming =
    streamingFor || streamingAgainst || streamingJudge;
  const activeRoundNumber =
    completedRounds.length + (hasActiveStreaming ? 1 : 0);

  // Collect all round scores for the panel
  const roundScores = completedRounds
    .map((r) => r.scores)
    .filter(Boolean) as NonNullable<(typeof completedRounds)[0]["scores"]>[];

  return (
    <div className="max-w-5xl mx-auto">
      <TopicBanner
        topic={session.topic}
        mode={session.mode}
        userPosition={session.user_position}
        totalRounds={session.total_rounds}
      />

      {/* Connection status */}
      {!connected && !isComplete && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Spinner size="sm" />
          <span>Connecting to debate server...</span>
        </div>
      )}

      {wsError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {wsError}
        </div>
      )}

      <div className="flex gap-6">
        {/* Main debate feed */}
        <div
          ref={feedRef}
          className="flex-1 overflow-y-auto max-h-[70vh] space-y-4 scrollbar-hide"
        >
          {/* Completed rounds */}
          {completedRounds.map((round) => (
            <div key={round.round_number}>
              <RoundHeader
                roundNumber={round.round_number}
                totalRounds={session.total_rounds}
              />
              <div className="space-y-3">
                {round.argument_for && (
                  <ArgumentCard
                    position="for"
                    argument={round.argument_for}
                    roundNumber={round.round_number}
                    isUser={
                      session.mode === "user_vs_ai" &&
                      session.user_position === "for"
                    }
                  />
                )}
                {round.argument_against && (
                  <ArgumentCard
                    position="against"
                    argument={round.argument_against}
                    roundNumber={round.round_number}
                    isUser={
                      session.mode === "user_vs_ai" &&
                      session.user_position === "against"
                    }
                  />
                )}
                {round.scores && (
                  <JudgeFeedback
                    scores={round.scores}
                    streamingText=""
                    isStreaming={false}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Active (streaming) round */}
          {hasActiveStreaming && (
            <div>
              <RoundHeader
                roundNumber={activeRoundNumber}
                totalRounds={session.total_rounds}
              />
              <div className="space-y-3">
                {streamingFor && (
                  <StreamingArgument
                    position="for"
                    text={streamingFor}
                    isStreaming={!streamingAgainst && !streamingJudge}
                  />
                )}
                {streamingAgainst && (
                  <StreamingArgument
                    position="against"
                    text={streamingAgainst}
                    isStreaming={!streamingJudge}
                  />
                )}
                {streamingJudge && (
                  <JudgeFeedback
                    scores={null}
                    streamingText={streamingJudge}
                    isStreaming={true}
                  />
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!hasActiveStreaming && completedRounds.length === 0 && connected && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <Spinner />
              <p className="text-sm">The debate is starting...</p>
            </div>
          )}
        </div>

        {/* Score sidebar */}
        <div className="w-56 flex-shrink-0">
          <ScorePanel
            cumulativeFor={cumulativeFor}
            cumulativeAgainst={cumulativeAgainst}
            rounds={roundScores}
            totalRounds={session.total_rounds}
          />
        </div>
      </div>

      {/* User input box (user_vs_ai mode) */}
      {isUserTurn && userTurnPosition && (
        <div className="mt-6">
          <UserInputBox
            onSubmit={submitUserArgument}
            position={userTurnPosition}
            roundNumber={userTurnRound}
          />
        </div>
      )}

      {/* Winner modal */}
      {isComplete && result && (
        <WinnerModal
          result={result}
          topic={session.topic}
          onClose={() => {}}
        />
      )}
    </div>
  );
}
