"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { countMora } from "@/lib/moraCounts";

const SLOT_TARGETS: [number, number, number] = [5, 7, 5];
const SLOT_LABELS = ["上の句", "中の句", "下の句"];
const SLOT_LABELS_SHORT = ["上", "中", "下"];

interface SlotLocalState {
  partText: string;
  partMora: number;
  freeText: string;
}

export default function HaikuBuilder({
  onValidChange,
}: {
  onValidChange: (valid: boolean, lines: [string, string, string]) => void;
}) {
  const { slots, shuffleCandidates, initCandidates } = useAppStore();
  const [activeSlot, setActiveSlot] = useState<0 | 1 | 2>(0);
  const [slotStates, setSlotStates] = useState<SlotLocalState[]>([
    { partText: "", partMora: 0, freeText: "" },
    { partText: "", partMora: 0, freeText: "" },
    { partText: "", partMora: 0, freeText: "" },
  ]);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initCandidates();
    }
  }, [initCandidates]);

  const getSlotText = (i: number) => {
    const s = slotStates[i];
    return s.partText || s.freeText;
  };

  const getSlotMora = (i: number) => {
    const s = slotStates[i];
    return s.partText ? s.partMora : countMora(s.freeText);
  };

  const lines = [0, 1, 2].map(getSlotText) as [string, string, string];
  const isValid = [0, 1, 2].every((i) => getSlotMora(i) === SLOT_TARGETS[i]);

  useEffect(() => {
    onValidChange(isValid, lines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, lines[0], lines[1], lines[2]]);

  const handlePartTap = (text: string, mora: number) => {
    setSlotStates((prev) => {
      const next = [...prev];
      const s = { ...next[activeSlot] };
      s.freeText = "";
      s.partText = s.partText + text;
      s.partMora = s.partMora + mora;
      next[activeSlot] = s;
      return next;
    });
  };

  const handleFreeTextChange = (value: string) => {
    setSlotStates((prev) => {
      const next = [...prev];
      const s = { ...next[activeSlot] };
      s.freeText = value;
      s.partText = "";
      s.partMora = 0;
      next[activeSlot] = s;
      return next;
    });
  };

  const handleClear = () => {
    setSlotStates((prev) => {
      const next = [...prev];
      next[activeSlot] = { partText: "", partMora: 0, freeText: "" };
      return next;
    });
  };

  const active = slotStates[activeSlot];
  const isPartsMode = active.partText !== "";
  const activeText = isPartsMode ? active.partText : active.freeText;
  const activeMora = getSlotMora(activeSlot);
  const activeTarget = SLOT_TARGETS[activeSlot];
  const isOver = activeMora > activeTarget;
  const isExact = activeMora === activeTarget;

  return (
    <div>
      {/* Three boxes in a row */}
      <div className="flex gap-2 mb-3">
        {([0, 1, 2] as const).map((i) => {
          const text = getSlotText(i);
          const mora = getSlotMora(i);
          const target = SLOT_TARGETS[i];
          const exact = mora === target;
          const over = mora > target;
          const isActive = activeSlot === i;
          return (
            <button
              key={i}
              onClick={() => setActiveSlot(i)}
              className={`flex-1 rounded-xl p-2.5 border text-left transition-all ${
                exact
                  ? "border-green-500 bg-green-50"
                  : isActive
                  ? "border-[#2C4A7C] bg-[#2C4A7C]/10"
                  : "border-[#D4C9B8] bg-white/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#2C4A7C]">
                  {SLOT_LABELS_SHORT[i]}
                </span>
                <span
                  className={`text-xs font-bold ${
                    exact ? "text-green-600" : over ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {mora}/{target}{exact && "✓"}
                </span>
              </div>
              <div
                className="text-sm leading-snug break-all min-h-[18px]"
                style={{ fontFamily: "var(--font-kaisei)" }}
              >
                {text ? (
                  text
                ) : (
                  <span className="text-gray-300 text-xs">タップして入力</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Unified candidate panel */}
      <div className="bg-white/60 rounded-2xl p-4 border border-[#D4C9B8]">
        {/* Panel header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#2C4A7C]">
            {SLOT_LABELS[activeSlot]}（{activeTarget}音）
          </span>
          <span
            className={`text-sm font-bold ${
              isExact ? "text-green-600" : isOver ? "text-red-500" : "text-gray-500"
            }`}
          >
            {activeMora}/{activeTarget}音{isExact && " ✓"}{isOver && " ！"}
          </span>
        </div>

        {/* Input field */}
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
              value={active.freeText}
              onChange={(e) => handleFreeTextChange(e.target.value)}
              placeholder="直接入力、または下の候補から選択"
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
            onClick={() => shuffleCandidates(activeSlot)}
            className="text-xs text-[#2C4A7C] underline"
          >
            別の候補 ⟳
          </button>
        </div>

        {/* Candidate buttons */}
        <div className="flex flex-wrap gap-1.5">
          {slots[activeSlot].candidates.map((part) => (
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
    </div>
  );
}
