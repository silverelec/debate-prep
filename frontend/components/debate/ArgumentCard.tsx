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
  const borderColor = isFor ? "border-blue-300" : "border-red-300";
  const bgColor = isFor ? "bg-blue-50" : "bg-red-50";
  const labelColor = isFor ? "text-blue-700" : "text-red-700";
  const badgeBg = isFor ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800";

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeBg}`}>
          {getPositionLabel(position)}
        </span>
        {isUser && (
          <span className="text-xs text-gray-500 font-medium">You</span>
        )}
      </div>
      <p className={`text-sm leading-relaxed ${labelColor === "text-blue-700" ? "text-blue-900" : "text-red-900"}`}>
        {argument}
      </p>
    </div>
  );
}
