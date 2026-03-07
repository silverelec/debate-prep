"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/api";
import { Session, Score } from "@/lib/types";
import { formatDate, formatScore, getPositionLabel, getWinnerLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { RoundHeader } from "@/components/debate/RoundHeader";
import { ArgumentCard } from "@/components/debate/ArgumentCard";

export default function SessionReviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId)
      .then(setSession)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-2">
        <Link href="/history" className="text-sm text-blue-600 hover:underline">
          ← History
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <p className="font-semibold text-gray-900 text-lg mb-3">{session.topic}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={session.mode === "user_vs_ai" ? "blue" : "purple"}>
            {session.mode === "user_vs_ai" ? "User vs AI" : "AI vs AI"}
          </Badge>
          <Badge variant="gray">{session.total_rounds} rounds</Badge>
          {session.user_position && (
            <Badge variant={session.user_position === "for" ? "blue" : "red"}>
              You: {getPositionLabel(session.user_position)}
            </Badge>
          )}
        </div>
        {session.winner && (
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-gray-900">
              {getWinnerLabel(session.winner)}
            </div>
            {session.final_score_for !== null && session.final_score_against !== null && (
              <div className="text-sm">
                <span className="text-blue-600 font-medium">{formatScore(session.final_score_for)}</span>
                <span className="text-gray-400 mx-1">vs</span>
                <span className="text-red-600 font-medium">{formatScore(session.final_score_against)}</span>
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">{formatDate(session.created_at)}</p>
      </div>

      <div className="space-y-4">
        {(session.rounds || [])
          .sort((a, b) => a.round_number - b.round_number)
          .map((round) => {
            const forScore = round.scores?.find((s: Score) => s.scored_position === "for");
            const againstScore = round.scores?.find((s: Score) => s.scored_position === "against");
            return (
              <div key={round.id}>
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
                      isUser={session.mode === "user_vs_ai" && session.user_position === "for"}
                    />
                  )}
                  {round.argument_against && (
                    <ArgumentCard
                      position="against"
                      argument={round.argument_against}
                      roundNumber={round.round_number}
                      isUser={session.mode === "user_vs_ai" && session.user_position === "against"}
                    />
                  )}
                  {(forScore || againstScore) && (
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 inline-block mb-3">
                        JUDGE SCORES
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        {([["for", forScore], ["against", againstScore]] as const).map(([pos, score]) => {
                          if (!score) return null;
                          const isFor = pos === "for";
                          return (
                            <div key={pos} className="bg-white rounded-lg p-3 border border-purple-100">
                              <div className="flex justify-between mb-1">
                                <span className={`text-xs font-bold ${isFor ? "text-blue-700" : "text-red-700"}`}>
                                  {getPositionLabel(pos)}
                                </span>
                                <span className={`text-sm font-bold ${isFor ? "text-blue-700" : "text-red-700"}`}>
                                  {formatScore(score.weighted_total)}/10
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{score.feedback}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
