"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { countMora } from "@/lib/moraCounts";

export default function HaikuTextInput({
  onValidChange,
}: {
  onValidChange: (valid: boolean, lines: [string, string, string]) => void;
}) {
  const { textInput, setTextInput } = useAppStore();

  const rawParts = textInput.split(/[／/]/);
  const parts: [string, string, string] = [
    rawParts[0] ?? "",
    rawParts[1] ?? "",
    rawParts[2] ?? "",
  ];

  const counts = parts.map(countMora) as [number, number, number];
  const targets: [number, number, number] = [5, 7, 5];
  const isValid =
    rawParts.length === 3 &&
    counts[0] === 5 &&
    counts[1] === 7 &&
    counts[2] === 5;

  // Notify parent in useEffect — never call setX from another component's render
  useEffect(() => {
    onValidChange(isValid, parts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, parts[0], parts[1], parts[2]]);

  return (
    <div className="bg-white/60 rounded-2xl p-4 border border-[#D4C9B8]">
      <p className="text-xs text-gray-500 mb-2">
        「/」または「／」で区切って入力してください
      </p>
      <p className="text-xs text-gray-400 mb-3">
        例：はるかぜが／さくらちりゆく／ゆうぐれに
      </p>

      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="はるかぜが／さくらちりゆく／ゆうぐれに"
        className="w-full p-3 rounded-xl border border-[#D4C9B8] bg-[#F5F0E8] text-[#1A1A1A] text-lg focus:outline-none focus:border-[#2C4A7C] resize-none"
        style={{ fontFamily: "var(--font-kaisei)", minHeight: "80px" }}
        rows={3}
      />

      {textInput && (
        <div className="mt-3 space-y-1">
          {parts.map((part, i) => {
            const count = counts[i];
            const target = targets[i];
            const label = ["上の句", "中の句", "下の句"][i];
            if (!part) return null;
            return (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{label}：{part}</span>
                <span
                  className={
                    count === target
                      ? "text-green-600 font-bold"
                      : "text-red-500"
                  }
                >
                  {count === target
                    ? `${count}音 ✓`
                    : `${count}音（${target}音必要）`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
