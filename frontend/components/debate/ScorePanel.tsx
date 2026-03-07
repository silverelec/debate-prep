import { formatScore } from "@/lib/utils";
import { JudgeScores } from "@/lib/types";

interface ScorePanelProps {
  cumulativeFor: number;
  cumulativeAgainst: number;
  rounds: JudgeScores[];
  totalRounds: number;
}

function ScoreBar({
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
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">{label}</span>
        <span>{formatScore(score)}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 sticky top-4">
      <h2 className="font-semibold text-gray-800 text-sm">Scores</h2>

      <ScoreBar
        label="FOR"
        score={cumulativeFor}
        maxScore={maxPossible}
        color="bg-blue-500"
      />
      <ScoreBar
        label="AGAINST"
        score={cumulativeAgainst}
        maxScore={maxPossible}
        color="bg-red-500"
      />

      {rounds.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Round breakdown</p>
          <div className="space-y-2">
            {rounds.map((r) => (
              <div key={r.round} className="text-xs">
                <span className="text-gray-500">R{r.round}: </span>
                <span className="text-blue-600 font-medium">{formatScore(r.score_for)}</span>
                <span className="text-gray-400 mx-1">vs</span>
                <span className="text-red-600 font-medium">{formatScore(r.score_against)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
