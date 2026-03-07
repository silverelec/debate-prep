import { Position } from "@/lib/types";
import { getPositionLabel } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

interface StreamingArgumentProps {
  position: Position;
  text: string;
  isStreaming: boolean;
}

export function StreamingArgument({
  position,
  text,
  isStreaming,
}: StreamingArgumentProps) {
  if (!isStreaming && !text) return null;

  const isFor = position === "for";
  const borderColor = isFor ? "border-blue-300" : "border-red-300";
  const bgColor = isFor ? "bg-blue-50" : "bg-red-50";
  const badgeBg = isFor
    ? "bg-blue-100 text-blue-800"
    : "bg-red-100 text-red-800";

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeBg}`}>
          {getPositionLabel(position)}
        </span>
        {isStreaming && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Spinner size="sm" /> Generating...
          </span>
        )}
      </div>
      <p
        className={`text-sm leading-relaxed ${
          isFor ? "text-blue-900" : "text-red-900"
        } ${isStreaming ? "cursor-blink" : ""}`}
      >
        {text}
      </p>
    </div>
  );
}
