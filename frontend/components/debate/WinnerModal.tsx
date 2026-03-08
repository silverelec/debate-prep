import { DebateComplete } from "@/lib/types";
import { formatScore, getWinnerLabel } from "@/lib/utils";

interface WinnerModalProps {
  result: DebateComplete;
  topic: string;
  onClose: () => void;
}

export function WinnerModal({ result, topic, onClose }: WinnerModalProps) {
  const bgGradient =
    result.winner === "for"
      ? "from-blue-600 to-indigo-700"
      : result.winner === "against"
      ? "from-red-600 to-rose-700"
      : "from-gray-600 to-gray-800";

  const winnerTextGradient =
    result.winner === "for"
      ? "from-blue-200 to-indigo-200"
      : result.winner === "against"
      ? "from-red-200 to-rose-200"
      : "from-gray-200 to-gray-300";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="animate-modal-in bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Banner */}
        <div
          className={`bg-gradient-to-br ${bgGradient} p-8 text-center relative overflow-hidden`}
        >
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="text-5xl mb-3 relative">🏆</div>
          <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-1 relative">
            Winner
          </p>
          <h2
            className={`text-3xl font-bold bg-gradient-to-r ${winnerTextGradient} bg-clip-text text-transparent relative`}
          >
            {getWinnerLabel(result.winner)}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-400 text-center mb-5 leading-relaxed italic">
            &ldquo;{topic}&rdquo;
          </p>

          <div className="flex gap-4 justify-center mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {formatScore(result.final_score_for)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">
                For
              </p>
            </div>
            <div className="text-gray-200 text-2xl font-light self-center">
              vs
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {formatScore(result.final_score_against)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">
                Against
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href="/history"
              className="flex-1 text-center py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              View History
            </a>
            <a
              href="/"
              className="flex-1 text-center py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              New Debate
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
