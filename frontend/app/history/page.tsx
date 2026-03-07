"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listSessions } from "@/lib/api";
import { Session } from "@/lib/types";
import { formatDate, formatScore, getPositionLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Debate History</h1>
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          New debate →
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No debates yet</p>
          <Link href="/" className="text-blue-600 text-sm hover:underline">
            Start your first debate
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/history/${s.id}`}
              className="block bg-white rounded-xl border border-gray-200 hover:border-gray-300 p-5 transition-all hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{s.topic}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant={s.mode === "user_vs_ai" ? "blue" : "purple"}>
                      {s.mode === "user_vs_ai" ? "User vs AI" : "AI vs AI"}
                    </Badge>
                    <Badge
                      variant={
                        s.status === "completed"
                          ? "green"
                          : s.status === "in_progress"
                          ? "yellow"
                          : "gray"
                      }
                    >
                      {s.status}
                    </Badge>
                    {s.user_position && (
                      <Badge variant={s.user_position === "for" ? "blue" : "red"}>
                        You: {getPositionLabel(s.user_position)}
                      </Badge>
                    )}
                    {s.winner && (
                      <Badge
                        variant={
                          s.winner === "for"
                            ? "blue"
                            : s.winner === "against"
                            ? "red"
                            : "gray"
                        }
                      >
                        {s.winner === "tie" ? "TIE" : `${getPositionLabel(s.winner)} wins`}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.final_score_for !== null && s.final_score_against !== null && (
                    <p className="text-sm font-medium">
                      <span className="text-blue-600">{formatScore(s.final_score_for)}</span>
                      <span className="text-gray-400 mx-1">vs</span>
                      <span className="text-red-600">{formatScore(s.final_score_against)}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(s.created_at)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
