import { Position } from "@/lib/types";
import { getPositionLabel } from "@/lib/utils";

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
  const borderAccent = isFor ? "border-l-blue-400" : "border-l-red-400";
  const bgColor = isFor ? "bg-blue-50" : "bg-red-50";
  const badgeBg = isFor
    ? "bg-blue-100 text-blue-800"
    : "bg-red-100 text-red-800";
  const textColor = isFor ? "text-blue-900" : "text-red-900";
  const avatarBg = isFor ? "bg-blue-100" : "bg-red-100";
  const dotColor = isFor ? "bg-blue-400" : "bg-red-400";
  const glowClass = isStreaming
    ? isFor
      ? "streaming-glow-for"
      : "streaming-glow-against"
    : "";

  return (
    <div
      className={`rounded-lg border border-gray-100 border-l-4 ${borderAccent} ${bgColor} p-4 ${glowClass}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center text-sm flex-shrink-0`}
        >
          🤖
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeBg}`}>
          {getPositionLabel(position)}
        </span>
        {isStreaming && (
          <span className="flex items-center gap-1 ml-1">
            <span className={`typing-dot ${dotColor}`} />
            <span className={`typing-dot ${dotColor}`} />
            <span className={`typing-dot ${dotColor}`} />
          </span>
        )}
      </div>
      <p
        className={`text-sm leading-7 ${textColor} ${
          isStreaming ? "cursor-blink" : ""
        }`}
      >
        {text}
      </p>
    </div>
  );
}
