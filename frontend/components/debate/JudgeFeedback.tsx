import { JudgeScores } from "@/lib/types";
import { formatScore } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

interface JudgeFeedbackProps {
  scores: JudgeScores | null;
  streamingText: string;
  isStreaming: boolean;
}

export function JudgeFeedback({
  scores,
  streamingText,
  isStreaming,
}: JudgeFeedbackProps) {
  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
          JUDGE
        </span>
        {isStreaming && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Spinner size="sm" /> Evaluating...
          </span>
        )}
      </div>

      {scores ? (
        <div className="space-y-3">
          <p className="text-sm text-purple-900">{scores.round_summary}</p>

          <div className="grid grid-cols-2 gap-3">
            {(["for", "against"] as const).map((pos) => {
              const detail = pos === "for" ? scores.detail_for : scores.detail_against;
              const color = pos === "for" ? "text-blue-700" : "text-red-700";
              const label = pos === "for" ? "FOR" : "AGAINST";
              const roundScore = pos === "for" ? scores.score_for : scores.score_against;
              return (
                <div key={pos} className="bg-white rounded-lg p-3 border border-purple-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold ${color}`}>{label}</span>
                    <span className={`text-sm font-bold ${color}`}>
                      {formatScore(roundScore)}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    {detail.feedback}
                  </p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Argument Quality (40%)</span>
                      <span>{formatScore(detail.argument_quality)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Responsiveness (30%)</span>
                      <span>{formatScore(detail.responsiveness)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impact Analysis (20%)</span>
                      <span>{formatScore(detail.impact_analysis)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Debate Skill (10%)</span>
                      <span>{formatScore(detail.debate_skill)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : isStreaming && streamingText ? (
        <p className={`text-sm text-purple-900 leading-relaxed cursor-blink`}>
          {streamingText}
        </p>
      ) : null}
    </div>
  );
}
