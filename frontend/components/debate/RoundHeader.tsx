interface RoundHeaderProps {
  roundNumber: number;
  totalRounds: number;
}

export function RoundHeader({ roundNumber, totalRounds }: RoundHeaderProps) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
        Round {roundNumber} / {totalRounds}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
