import { Badge } from "@/components/ui/Badge";
import { DebateMode } from "@/lib/types";

interface TopicBannerProps {
  topic: string;
  mode: DebateMode;
  userPosition?: string | null;
  totalRounds: number;
}

export function TopicBanner({
  topic,
  mode,
  userPosition,
  totalRounds,
}: TopicBannerProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant={mode === "user_vs_ai" ? "blue" : "purple"}>
          {mode === "user_vs_ai" ? "User vs AI" : "AI vs AI"}
        </Badge>
        <Badge variant="gray">{totalRounds} rounds</Badge>
        {userPosition && (
          <Badge variant={userPosition === "for" ? "blue" : "red"}>
            You: {userPosition === "for" ? "FOR" : "AGAINST"}
          </Badge>
        )}
      </div>
      <h1 className="text-lg font-semibold text-gray-900">{topic}</h1>
    </div>
  );
}
