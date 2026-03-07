"use client";
import { useState } from "react";
import { Position } from "@/lib/types";
import { getPositionLabel } from "@/lib/utils";

interface UserInputBoxProps {
  onSubmit: (text: string) => void;
  position: Position;
  roundNumber: number;
}

export function UserInputBox({ onSubmit, position, roundNumber }: UserInputBoxProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  const isFor = position === "for";
  const ringColor = isFor ? "ring-blue-500" : "ring-red-500";
  const btnColor = isFor
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-red-600 hover:bg-red-700";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-500 mb-2">
        Round {roundNumber} — Your argument ({getPositionLabel(position)})
      </p>
      <textarea
        className={`w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 ${ringColor} min-h-[100px]`}
        placeholder="Make your argument using the CREI structure: Claim, Reasoning, Evidence, Impact..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-400">{text.length} chars · Ctrl+Enter to submit</span>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${btnColor} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          Submit Argument
        </button>
      </div>
    </div>
  );
}
