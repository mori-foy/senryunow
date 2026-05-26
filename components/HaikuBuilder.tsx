"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { countMora } from "@/lib/moraCounts";

const SLOT_TARGETS: [number, number, number] = [5, 7, 5];
const SLOT_LABELS = ["上の句", "中の句", "下の句"];

type SlotMode = "parts" | "free";

function SlotEditor({
  slotIndex,
  target,
  label,
  mode,
  freeText,
  onModeChange,
  onFreeTextChange,
}: {
  slotIndex: 0 | 1 | 2;
  target: number;
  label: string;
  mode: SlotMode;
  freeText: string;
  onModeChange: (mode: SlotMode) => void;
  onFreeTextChange: (text: string) => void;
}) {
  const { slots, togglePartSelection, shuffleCandidates } = useAppStore();
  const slot = slots[slotIndex];
  const selectedIds = new Set(slot.selected.map((p) => p.id));

  const partsMora = slot.selected.reduce((sum, p) => sum + p.mora, 0);
  const freeMora = countMora(freeText);
  const totalMora = mode === "free" ? freeMora : partsMora;
  const displayText =
    mode === "free" ? freeText : slot.selected.map((p) => p.text).join("");

  const isOver = totalMora > target;
  const isExact = totalMora === target;

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
          {totalMora}/{target}音{isExact && " ✓"}{isOver && " ！"}
        </span>
      </div>

      {/* Vertical display area */}
      <div className="flex flex-row-reverse justify-start gap-3 min-h-[88px] mb-2 px-3 py-2 bg-[#F5F0E8] rounded-xl border border-dashed border-[#C0392B]/30 overflow-x-auto">
        {displayText ? (
          <div
            className="text-xl text-[#1A1A1A] leading-relaxed"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              fontFamily: "var(--font-kaisei)",
            }}
          >
            {displayText}
          </div>
        ) : (
          <span className="text-xs text-gray-400 self-center w-full text-center">
            {mode === "free" ? "下のボックスに入力してください" : "下からパーツを選んでください"}
          </span>
        )}
      </div>

      {/* Free text input */}
      {mode === "free" && (
        <input
          type="text"
          value={freeText}
          onChange={(e) => onFreeTextChange(e.target.value)}
          placeholder={label + "を入力…"}
          autoFocus
          className="w-full px-3 py-2 mb-2 text-lg rounded-xl border border-[#2C4A7C]/40 bg-white focus:outline-none focus:border-[#2C4A7C]"
          style={{ fontFamily: "var(--font-kaisei)" }}
        />
      )}

      {/* Mode toggle */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => onModeChange(mode === "free" ? "parts" : "free")}
          className="text-xs text-[#2C4A7C] underline"
        >
          {mode === "free" ? "← パーツ選択に戻す" : "直接入力する →"}
        </button>
        {mode === "parts" && (
          <button
            onClick={() => shuffleCandidates(slotIndex)}
            className="text-xs text-[#2C4A7C] underline"
          >
            候補をシャッフル ⟳
          </button>
        )}
      </div>

      {/* Parts candidates (parts mode only) */}
      {mode === "parts" && (
        <div className="flex flex-wrap gap-1.5">
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
                <span style={{ fontFamily: "var(--font-kaisei)" }}>{part.text}</span>
                <span className="text-xs text-gray-400 ml-1">({part.mora})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HaikuBuilder({
  onValidChange,
}: {
  onValidChange: (valid: boolean, lines: [string, string, string]) => void;
}) {
  const { slots, initCandidates } = useAppStore();
  const [modes, setModes] = useState<[SlotMode, SlotMode, SlotMode]>(["parts", "parts", "parts"]);
  const [freeTexts, setFreeTexts] = useState<[string, string, string]>(["", "", ""]);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initCandidates();
    }
  }, [initCandidates]);

  const handleModeChange = (i: 0 | 1 | 2, mode: SlotMode) => {
    setModes((prev) => { const next = [...prev] as [SlotMode, SlotMode, SlotMode]; next[i] = mode; return next; });
  };

  const handleFreeTextChange = (i: 0 | 1 | 2, text: string) => {
    setFreeTexts((prev) => { const next = [...prev] as [string, string, string]; next[i] = text; return next; });
  };

  const lines: [string, string, string] = [0, 1, 2].map((i) =>
    modes[i] === "free"
      ? freeTexts[i]
      : slots[i].selected.map((p) => p.text).join("")
  ) as [string, string, string];

  const moraTargets: [number, number, number] = [5, 7, 5];
  const isValid = [0, 1, 2].every((i) => {
    const mora =
      modes[i] === "free"
        ? countMora(freeTexts[i])
        : slots[i].selected.reduce((sum, p) => sum + p.mora, 0);
    return mora === moraTargets[i];
  });

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
          mode={modes[i]}
          freeText={freeTexts[i]}
          onModeChange={(mode) => handleModeChange(i as 0 | 1 | 2, mode)}
          onFreeTextChange={(text) => handleFreeTextChange(i as 0 | 1 | 2, text)}
        />
      ))}
    </div>
  );
}
