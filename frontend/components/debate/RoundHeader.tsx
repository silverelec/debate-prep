interface RoundHeaderProps {
  roundNumber: number;
  totalRounds: number;
  isActive?: boolean;
}

export function RoundHeader({
  roundNumber,
  totalRounds,
  isActive = false,
}: RoundHeaderProps) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <div
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide uppercase ${
          isActive
            ? "bg-indigo-50 border-indigo-200 text-indigo-600"
            : "bg-gray-50 border-gray-200 text-gray-500"
        }`}
      >
        {isActive && (
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse flex-shrink-0" />
        )}
        Round {roundNumber} of {totalRounds}
      </div>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
