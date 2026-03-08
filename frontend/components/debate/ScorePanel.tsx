import { formatScore } from "@/lib/utils";
import { JudgeScores } from "@/lib/types";

interface ScorePanelProps {
  cumulativeFor: number;
  cumulativeAgainst: number;
  rounds: JudgeScores[];
  totalRounds: number;
}

function ProgressBar({
  label,
  score,
  maxScore,
  color,
}: {
  label: string;
  score: number;
  maxScore: number;
  color: string;
}) {
  const pct = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-500 font-medium">{label}</span>
        <span className="font-semibold text-gray-700">{formatScore(score)}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ScorePanel({
  cumulativeFor,
  cumulativeAgainst,
  rounds,
  totalRounds,
}: ScorePanelProps) {
  const maxPossible = totalRounds * 10;
  const total = cumulativeFor + cumulativeAgainst;
  const forPct = total > 0 ? (cumulativeFor / total) * 100 : 50;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 sticky top-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Scoreboard
      </h2>

      {/* Big cumulative numbers */}
      <div className="flex items-stretch gap-1.5 text-center">
        <div className="flex-1 rounded-lg bg-blue-50 border border-blue-100 py-3 px-2">
          <p className="text-2xl font-bold text-blue-600 leading-none">
            {formatScore(cumulativeFor)}
          </p>
          <p className="text-xs text-blue-500 font-medium mt-1">FOR</p>
        </div>
        <div className="flex items-center text-gray-300 text-xs font-bold px-0.5">
          vs
        </div>
        <div className="flex-1 rounded-lg bg-red-50 border border-red-100 py-3 px-2">
          <p className="text-2xl font-bold text-red-600 leading-none">
            {formatScore(cumulativeAgainst)}
          </p>
          <p className="text-xs text-red-500 font-medium mt-1">AGN</p>
        </div>
      </div>

      {/* Head-to-head bar */}
      {total > 0 && (
        <div className="h-2 bg-red-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${forPct}%` }}
          />
        </div>
      )}

      {/* Progress vs max */}
      <div className="space-y-3">
        <ProgressBar
          label="FOR"
          score={cumulativeFor}
          maxScore={maxPossible}
          color="bg-blue-500"
        />
        <ProgressBar
          label="AGAINST"
          score={cumulativeAgainst}
          maxScore={maxPossible}
          color="bg-red-500"
        />
      </div>

      {/* Per-round breakdown */}
      {rounds.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            By Round
          </p>
          <div className="space-y-3">
            {rounds.map((r) => {
              const rTotal = r.score_for + r.score_against;
              const rForPct = rTotal > 0 ? (r.score_for / rTotal) * 100 : 50;
              return (
                <div key={r.round}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">
                      Round {r.round}
                    </span>
                    <span>
                      <span className="text-blue-600 font-semibold">
                        {formatScore(r.score_for)}
                      </span>
                      <span className="text-gray-300 mx-1">—</span>
                      <span className="text-red-600 font-semibold">
                        {formatScore(r.score_against)}
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-red-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${rForPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
