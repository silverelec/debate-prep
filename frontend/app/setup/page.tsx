"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSession, getTopics } from "@/lib/api";
import { Topic } from "@/lib/types";
import { getDifficultyColor } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

function SetupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get("mode") || "ai_vs_ai") as
    | "user_vs_ai"
    | "ai_vs_ai";

  const [topic, setTopic] = useState("");
  const [userPosition, setUserPosition] = useState<"for" | "against">("for");
  const [totalRounds, setTotalRounds] = useState(3);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTopics()
      .then(setTopics)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const session = await createSession({
        topic: topic.trim(),
        mode,
        user_position: mode === "user_vs_ai" ? userPosition : null,
        total_rounds: totalRounds,
      });
      router.push(`/debate/${session.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.15em] text-indigo-500 uppercase mb-2">
          {mode === "user_vs_ai" ? "User vs AI" : "AI vs AI"}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Configure your debate</h1>
        <p className="text-gray-400 text-sm mt-1">Choose a topic, set your position, and start.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-200 shadow-md p-6">
        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Debate Topic
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a debate topic or select one below..."
            rows={2}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Suggested topics */}
        {topics.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Suggested topics</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {topics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.title)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    topic === t.title
                      ? "border-blue-400 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{t.title}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getDifficultyColor(t.difficulty)}`}
                    >
                      {t.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Position (user_vs_ai only) */}
        {mode === "user_vs_ai" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Position
            </label>
            <div className="flex gap-3">
              {(["for", "against"] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setUserPosition(pos)}
                  className={`flex-1 py-3 rounded-lg border font-medium text-sm transition-colors ${
                    userPosition === pos
                      ? pos === "for"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {pos === "for" ? "FOR (Support)" : "AGAINST (Oppose)"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Number of rounds */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Rounds: <span className="text-blue-600">{totalRounds}</span>
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={totalRounds}
            onChange={(e) => setTotalRounds(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="w-full py-3 rounded-lg bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Spinner size="sm" /> Starting debate...
            </>
          ) : (
            "Start Debate"
          )}
        </button>
      </form>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense>
      <SetupForm />
    </Suspense>
  );
}
