import { Position } from "@/lib/types";
import { getPositionLabel } from "@/lib/utils";

interface ArgumentCardProps {
  position: Position;
  argument: string;
  roundNumber: number;
  isUser?: boolean;
}

export function ArgumentCard({
  position,
  argument,
  roundNumber,
  isUser = false,
}: ArgumentCardProps) {
  const isFor = position === "for";
  const borderAccent = isFor ? "border-l-blue-400" : "border-l-red-400";
  const bgColor = isFor ? "bg-blue-50" : "bg-red-50";
  const badgeBg = isFor
    ? "bg-blue-100 text-blue-800"
    : "bg-red-100 text-red-800";
  const textColor = isFor ? "text-blue-900" : "text-red-900";
  const avatarBg = isFor ? "bg-blue-100" : "bg-red-100";
  const avatar = isUser ? "🧑" : "🤖";

  return (
    <div
      className={`rounded-lg border border-gray-100 border-l-4 ${borderAccent} ${bgColor} p-4`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center text-sm flex-shrink-0`}
        >
          {avatar}
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeBg}`}>
          {getPositionLabel(position)}
        </span>
        {isUser && (
          <span className="text-xs text-gray-500 font-medium">You</span>
        )}
      </div>
      <p className={`text-sm leading-7 ${textColor}`}>{argument}</p>
    </div>
  );
}
