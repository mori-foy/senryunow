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
  onLineChange,
}: {
  slotIndex: 0 | 1 | 2;
  target: number;
  label: string;
  onLineChange: (text: string, mora: number) => void;
}) {
  const { slots, shuffleCandidates } = useAppStore();
  const slot = slots[slotIndex];

  const [partText, setPartText] = useState("");
  const [partMora, setPartMora] = useState(0);
  const [freeText, setFreeText] = useState("");

  const isPartsMode = partText !== "";
  const activeText = isPartsMode ? partText : freeText;
  const mora = isPartsMode ? partMora : countMora(freeText);
  const isOver = mora > target;
  const isExact = mora === target;

  useEffect(() => {
    onLineChange(activeText, mora);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeText, mora]);

  const handleClear = () => {
    setPartText("");
    setPartMora(0);
    setFreeText("");
  };

  const handlePartTap = (text: string, m: number) => {
    setFreeText("");
    setPartText((prev) => prev + text);
    setPartMora((prev) => prev + m);
  };

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

      {/* Single box */}
      <div className="relative mb-3">
        {isPartsMode ? (
          <div
            className="w-full px-3 py-2 min-h-[44px] text-lg rounded-xl border border-[#2C4A7C]/40 bg-[#EDE8DC] text-[#1A1A1A] pr-10"
            style={{ fontFamily: "var(--font-kaisei)" }}
          >
            {activeText}
          </div>
        ) : (
          <input
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="タップして入力、または下の候補から選択"
            className="w-full px-3 py-2 text-base rounded-xl border border-[#2C4A7C]/40 bg-white focus:outline-none focus:border-[#2C4A7C] pr-10 placeholder:text-sm"
            style={{ fontFamily: "var(--font-kaisei)" }}
          />
        )}
        <button
          onClick={handleClear}
          disabled={activeText === ""}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
          別の候補 ⟳
        </button>
      </div>

      {/* Parts candidates */}
      <div className="flex flex-wrap gap-1.5">
        {slot.candidates.map((part) => (
          <button
            key={part.id}
            onClick={() => handlePartTap(part.text, part.mora)}
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
  const [lineData, setLineData] = useState<{ text: string; mora: number }[]>([
    { text: "", mora: 0 },
    { text: "", mora: 0 },
    { text: "", mora: 0 },
  ]);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initCandidates();
    }
  }, [initCandidates]);

  const handleLineChange = (i: 0 | 1 | 2, text: string, mora: number) => {
    setLineData((prev) => {
      const next = [...prev];
      next[i] = { text, mora };
      return next;
    });
  };

  const moraTargets: [number, number, number] = [5, 7, 5];
  const isValid = [0, 1, 2].every((i) => lineData[i].mora === moraTargets[i]);
  const lines = lineData.map((d) => d.text) as [string, string, string];

  useEffect(() => {
    onValidChange(isValid, lines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, lines[0], lines[1], lines[2]]);

  return (
    <div>
      {SLOT_TARGETS.map((target, i) => (
        <SlotEditor
          key={i}
          slotIndex={i as 0 | 1 | 2}
          target={target}
          label={SLOT_LABELS[i]}
          onLineChange={(text, mora) => handleLineChange(i as 0 | 1 | 2, text, mora)}
        />
      ))}
    </div>
  );
}
