"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { countMora } from "@/lib/moraCounts";

const SLOT_TARGETS: [number, number, number] = [5, 7, 5];
const SLOT_LABELS = ["上の句", "中の句", "下の句"];

function SlotEditor({
  slotIndex,
  target,
  label,
  text,
  onTextChange,
}: {
  slotIndex: 0 | 1 | 2;
  target: number;
  label: string;
  text: string;
  onTextChange: (text: string) => void;
}) {
  const { slots, shuffleCandidates } = useAppStore();
  const slot = slots[slotIndex];

  const mora = countMora(text);
  const isOver = mora > target;
  const isExact = mora === target;

  return (
    <div className="bg-white/60 rounded-2xl p-4 border border-[#D4C9B8] mb-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#2C4A7C]">
          {label}（{target}音）
        </span>
        <span
          className={`text-sm font-bold ${
            isExact ? "text-green-600" : isOver ? "text-red-500" : "text-gray-500"
          }`}
        >
          {mora}/{target}音{isExact && " ✓"}{isOver && " ！"}
        </span>
      </div>

      {/* Vertical display area */}
      <div className="flex flex-row-reverse justify-start gap-3 min-h-[88px] mb-2 px-3 py-2 bg-[#F5F0E8] rounded-xl border border-dashed border-[#C0392B]/30 overflow-x-auto">
        {text ? (
          <div
            className="text-xl text-[#1A1A1A] leading-relaxed"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              fontFamily: "var(--font-kaisei)",
            }}
          >
            {text}
          </div>
        ) : (
          <span className="text-xs text-gray-400 self-center w-full text-center">
            下のボックスに入力してください
          </span>
        )}
      </div>

      {/* Text input */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={label + "を入力…"}
          className="flex-1 px-3 py-2 text-lg rounded-xl border border-[#2C4A7C]/40 bg-white focus:outline-none focus:border-[#2C4A7C]"
          style={{ fontFamily: "var(--font-kaisei)" }}
        />
        <button
          onClick={() => onTextChange("")}
          disabled={!text}
          className="px-3 py-2 rounded-xl border border-red-300 text-red-400 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="クリア"
        >
          ✕
        </button>
      </div>

      {/* Shuffle button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => shuffleCandidates(slotIndex)}
          className="text-xs text-[#2C4A7C] underline"
        >
          候補をシャッフル ⟳
        </button>
      </div>

      {/* Parts candidates */}
      <div className="flex flex-wrap gap-1.5">
        {slot.candidates.map((part) => (
          <button
            key={part.id}
            onClick={() => onTextChange(text + part.text)}
            className="px-2.5 py-1 text-sm rounded-lg border transition-all active:scale-95 bg-white text-[#1A1A1A] border-[#2C4A7C]/30 hover:border-[#2C4A7C] hover:bg-[#2C4A7C]/5"
          >
            <span style={{ fontFamily: "var(--font-kaisei)" }}>{part.text}</span>
            <span className="text-xs text-gray-400 ml-1">({part.mora})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HaikuBuilder({
  onValidChange,
}: {
  onValidChange: (valid: boolean, lines: [string, string, string]) => void;
}) {
  const { initCandidates } = useAppStore();
  const [texts, setTexts] = useState<[string, string, string]>(["", "", ""]);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initCandidates();
    }
  }, [initCandidates]);

  const handleTextChange = (i: 0 | 1 | 2, text: string) => {
    setTexts((prev) => {
      const next = [...prev] as [string, string, string];
      next[i] = text;
      return next;
    });
  };

  const moraTargets: [number, number, number] = [5, 7, 5];
  const isValid = [0, 1, 2].every((i) => countMora(texts[i]) === moraTargets[i]);

  useEffect(() => {
    onValidChange(isValid, texts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, texts[0], texts[1], texts[2]]);

  return (
    <div>
      {SLOT_TARGETS.map((target, i) => (
        <SlotEditor
          key={i}
          slotIndex={i as 0 | 1 | 2}
          target={target}
          label={SLOT_LABELS[i]}
          text={texts[i]}
          onTextChange={(text) => handleTextChange(i as 0 | 1 | 2, text)}
        />
      ))}
    </div>
  );
}
