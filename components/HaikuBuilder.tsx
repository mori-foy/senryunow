"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { countMora } from "@/lib/moraCounts";

const SLOT_TARGETS: [number, number, number] = [5, 7, 5];
const SLOT_LABELS = ["上の句", "中の句", "下の句"];
const SLOT_LABELS_SHORT = ["上の句", "中の句", "下の句"];

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

  const handleFreeTextChange = (i: number, value: string) => {
    setSlotStates((prev) => {
      const next = [...prev];
      const s = { ...next[i] };
      s.freeText = value;
      s.partText = "";
      s.partMora = 0;
      next[i] = s;
      return next;
    });
  };

  const handleClear = (i: number) => {
    setSlotStates((prev) => {
      const next = [...prev];
      next[i] = { partText: "", partMora: 0, freeText: "" };
      return next;
    });
  };

  const activeMora = getSlotMora(activeSlot);
  const activeTarget = SLOT_TARGETS[activeSlot];
  const isOver = activeMora > activeTarget;
  const isExact = activeMora === activeTarget;

  return (
    <div>
      {/* Three boxes in a row — 上の句 right, 中の句 center, 下の句 left（右から縦書き） */}
      <div className="flex flex-row-reverse gap-2 mb-3">
        {([0, 1, 2] as const).map((i) => {
          const state = slotStates[i];
          const text = getSlotText(i);
          const mora = getSlotMora(i);
          const target = SLOT_TARGETS[i];
          const exact = mora === target;
          const over = mora > target;
          const isActive = activeSlot === i;
          const isPartsMode = state.partText !== "";

          return (
            <div
              key={i}
              onClick={() => setActiveSlot(i)}
              className={`flex-1 rounded-xl px-2 pt-2 pb-1 border transition-all cursor-pointer flex flex-col items-center ${
                exact
                  ? "border-green-500 bg-green-50"
                  : isActive
                  ? "border-[#2C4A7C] bg-[#2C4A7C]/10"
                  : "border-[#D4C9B8] bg-white/60"
              }`}
            >
              {/* Label */}
              <span
                className="font-bold text-[#2C4A7C] mb-1 leading-none"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed", fontSize: "10px" }}
              >
                {SLOT_LABELS_SHORT[i]}
              </span>

              {/* Vertical text area */}
              <div className="flex justify-center items-start flex-1" style={{ height: "130px" }}>
                {isPartsMode ? (
                  <div
                    className="text-lg text-[#1A1A1A] leading-none"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      fontFamily: "var(--font-kaisei)",
                    }}
                  >
                    {text}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={state.freeText}
                    onChange={(e) => {
                      setActiveSlot(i);
                      handleFreeTextChange(i, e.target.value);
                    }}
                    onFocus={() => setActiveSlot(i)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="入力"
                    className="bg-transparent focus:outline-none text-[#1A1A1A] placeholder:text-gray-300 cursor-text"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      fontFamily: "var(--font-kaisei)",
                      fontSize: "18px",
                      height: "130px",
                      width: "1.4em",
                    }}
                  />
                )}
              </div>

              {/* Mora count + clear */}
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={`text-xs font-bold ${
                    exact ? "text-green-600" : over ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {mora}/{target}{exact && "✓"}
                </span>
                {text && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleClear(i); }}
                    className="text-gray-300 hover:text-red-400 text-xs leading-none"
                    aria-label="クリア"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate panel */}
      <div className="bg-white/60 rounded-2xl p-4 border border-[#D4C9B8]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#2C4A7C]">
            {SLOT_LABELS[activeSlot]}の候補（{activeTarget}音）
          </span>
          <span
            className={`text-sm font-bold ${
              isExact ? "text-green-600" : isOver ? "text-red-500" : "text-gray-500"
            }`}
          >
            {activeMora}/{activeTarget}音{isExact && " ✓"}{isOver && " ！"}
          </span>
        </div>

        <div className="flex justify-end mb-2">
          <button
            onClick={() => shuffleCandidates(activeSlot)}
            className="text-xs text-[#2C4A7C] underline"
          >
            別の候補 ⟳
          </button>
        </div>

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
