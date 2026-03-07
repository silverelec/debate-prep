import { DebateComplete } from "@/lib/types";
import { formatScore, getWinnerLabel } from "@/lib/utils";

interface WinnerModalProps {
  result: DebateComplete;
  topic: string;
  onClose: () => void;
}

export function WinnerModal({ result, topic, onClose }: WinnerModalProps) {
  const bgColor =
    result.winner === "for"
      ? "from-blue-600 to-blue-800"
      : result.winner === "against"
      ? "from-red-600 to-red-800"
      : "from-gray-600 to-gray-800";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className={`bg-gradient-to-br ${bgColor} p-8 text-center`}>
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold text-white">
            {getWinnerLabel(result.winner)}
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 text-center mb-4 leading-relaxed">
            {topic}
          </p>
          <div className="flex gap-4 justify-center mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatScore(result.final_score_for)}
              </p>
              <p className="text-xs text-gray-500">FOR</p>
            </div>
            <div className="text-gray-300 text-2xl font-light">vs</div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {formatScore(result.final_score_against)}
              </p>
              <p className="text-xs text-gray-500">AGAINST</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="/history"
              className="flex-1 text-center py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              View History
            </a>
            <a
              href="/"
              className="flex-1 text-center py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              New Debate
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
