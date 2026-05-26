"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Part } from "@/data/parts";

const SLOT_TARGETS: [number, number, number] = [5, 7, 5];
const SLOT_LABELS = ["上の句", "中の句", "下の句"];

function SlotEditor({
  slotIndex,
  target,
  label,
}: {
  slotIndex: 0 | 1 | 2;
  target: number;
  label: string;
}) {
  const { slots, togglePartSelection, shuffleCandidates } = useAppStore();
  const slot = slots[slotIndex];
  const totalMora = slot.selected.reduce((sum, p) => sum + p.mora, 0);
  const isOver = totalMora > target;
  const isExact = totalMora === target;
  const selectedIds = new Set(slot.selected.map((p) => p.id));

  return (
    <div className="bg-white/60 rounded-2xl p-4 border border-[#D4C9B8] mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#2C4A7C]">
          {label}（{target}音）
        </span>
        <span
          className={`text-sm font-bold ${
            isExact
              ? "text-green-600"
              : isOver
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {totalMora}/{target}音
          {isExact && " ✓"}
          {isOver && " ！"}
        </span>
      </div>

      {/* Selected parts — vertical writing display, tap to remove */}
      <div className="flex flex-row-reverse justify-start gap-3 min-h-[88px] mb-3 px-3 py-2 bg-[#F5F0E8] rounded-xl border border-dashed border-[#C0392B]/30 overflow-x-auto">
        {slot.selected.length === 0 ? (
          <span className="text-xs text-gray-400 self-center w-full text-center">
            下からパーツを選んでください
          </span>
        ) : (
          slot.selected.map((part) => (
            <button
              key={part.id}
              onClick={() => togglePartSelection(slotIndex, part)}
              title="タップで削除"
              className="text-xl text-[#1A1A1A] hover:text-[#C0392B] active:scale-95 transition-all leading-relaxed shrink-0"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontFamily: "var(--font-kaisei)",
              }}
            >
              {part.text}
            </button>
          ))
        )}
      </div>

      {/* Candidates */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {slot.candidates.map((part) => {
          const isSelected = selectedIds.has(part.id);
          return (
            <button
              key={part.id}
              onClick={() => togglePartSelection(slotIndex, part)}
              disabled={isSelected}
              className={`px-2.5 py-1 text-sm rounded-lg border transition-all active:scale-95 ${
                isSelected
                  ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-[#1A1A1A] border-[#2C4A7C]/30 hover:border-[#2C4A7C] hover:bg-[#2C4A7C]/5"
              }`}
            >
              <span style={{ fontFamily: "var(--font-kaisei)" }}>
                {part.text}
              </span>
              <span className="text-xs text-gray-400 ml-1">({part.mora})</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => shuffleCandidates(slotIndex)}
        className="text-xs text-[#2C4A7C] underline"
      >
        候補をシャッフル ⟳
      </button>
    </div>
  );
}

export default function HaikuBuilder({
  onValidChange,
}: {
  onValidChange: (valid: boolean, lines: [string, string, string]) => void;
}) {
  const { slots, initCandidates } = useAppStore();

  // Populate candidates on client mount (avoids SSR/client mismatch)
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initCandidates();
    }
  }, [initCandidates]);

  const lines: [string, string, string] = [
    slots[0].selected.map((p) => p.text).join(""),
    slots[1].selected.map((p) => p.text).join(""),
    slots[2].selected.map((p) => p.text).join(""),
  ];

  const totals = slots.map((s) =>
    s.selected.reduce((sum, p) => sum + p.mora, 0)
  );
  const isValid = totals[0] === 5 && totals[1] === 7 && totals[2] === 5;

  // Notify parent — must be in useEffect to avoid updating parent during render
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
        />
      ))}
    </div>
  );
}
