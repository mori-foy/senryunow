"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { countMora } from "@/lib/moraCounts";
import { Part, getRandomParts } from "@/data/parts";

type PoemMode = "senryu" | "tanka";

const MODE_CONFIG = {
  senryu: {
    targets: [5, 7, 5],
    labels: ["上の句", "中の句", "下の句"],
  },
  tanka: {
    targets: [5, 7, 5, 7, 7],
    labels: ["上の句", "中の句", "下の句", "第四句", "結句"],
  },
};

interface SlotLocalState {
  partText: string;
  partMora: number;
  freeText: string;
}

const emptySlot = (): SlotLocalState => ({ partText: "", partMora: 0, freeText: "" });

export default function HaikuBuilder({
  onValidChange,
}: {
  onValidChange: (valid: boolean, lines: string[], mode: PoemMode, jiari: boolean) => void;
}) {
  const { slots, shuffleCandidates, initCandidates } = useAppStore();
  const [mode, setMode] = useState<PoemMode>("senryu");
  const [jiari, setJiari] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const [slotStates, setSlotStates] = useState<SlotLocalState[]>([
    emptySlot(), emptySlot(), emptySlot(),
  ]);
  const [tankaCandidates, setTankaCandidates] = useState<[Part[], Part[]]>([[], []]);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initCandidates();
    }
  }, [initCandidates]);

  const config = MODE_CONFIG[mode];
  const targets = config.targets;

  const getSlotText = (i: number) => {
    const s = slotStates[i];
    return s ? (s.partText || s.freeText) : "";
  };

  const getSlotMora = (i: number) => {
    const s = slotStates[i];
    if (!s) return 0;
    return s.partText ? s.partMora : countMora(s.freeText);
  };

  const isSlotValid = (mora: number, target: number) =>
    jiari ? Math.abs(mora - target) <= 1 : mora === target;

  const lines = targets.map((_, i) => getSlotText(i));
  const isValid = targets.every((target, i) => isSlotValid(getSlotMora(i), target));
  const linesStr = lines.join("／");

  useEffect(() => {
    onValidChange(isValid, lines, mode, jiari);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, linesStr, mode, jiari]);

  const handleModeChange = (newMode: PoemMode) => {
    if (mode === newMode) return;
    const hasContent = slotStates.some((s) => s.partText || s.freeText);
    if (hasContent && !window.confirm("入力内容をリセットしてモードを切り替えますか？")) return;
    const count = newMode === "senryu" ? 3 : 5;
    setSlotStates(Array.from({ length: count }, emptySlot));
    if (newMode === "tanka") {
      setTankaCandidates([getRandomParts(10), getRandomParts(10)]);
    }
    setActiveSlot(0);
    setMode(newMode);
  };

  const getCandidates = (slotIdx: number): Part[] => {
    if (slotIdx < 3) return slots[slotIdx as 0 | 1 | 2].candidates;
    return tankaCandidates[slotIdx - 3];
  };

  const handleShuffle = (slotIdx: number) => {
    if (slotIdx < 3) {
      shuffleCandidates(slotIdx as 0 | 1 | 2);
    } else {
      setTankaCandidates((prev) => {
        const next = [...prev] as [Part[], Part[]];
        next[slotIdx - 3] = getRandomParts(10);
        return next;
      });
    }
  };

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
      next[i] = emptySlot();
      return next;
    });
  };

  const isTanka = mode === "tanka";

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => handleModeChange("tanka")}
          className={`flex-1 py-2 text-sm font-bold rounded-xl border-2 transition-all ${
            isTanka
              ? "bg-[#E0852A] text-white border-[#E0852A]"
              : "bg-white/60 text-[#E0852A] border-[#E0852A]"
          }`}
          style={{ fontFamily: "var(--font-kaisei)" }}
        >
          短歌モード
        </button>
        <button
          onClick={() => handleModeChange("senryu")}
          className={`flex-1 py-2 text-sm font-bold rounded-xl border-2 transition-all ${
            !isTanka
              ? "bg-[#2C4A7C] text-white border-[#2C4A7C]"
              : "bg-white/60 text-[#2C4A7C] border-[#2C4A7C]"
          }`}
          style={{ fontFamily: "var(--font-kaisei)" }}
        >
          川柳モード
        </button>
      </div>

      {/* Slot boxes */}
      <div className={`flex flex-row-reverse mb-3 ${isTanka ? "gap-1" : "gap-2"}`}>
        {targets.map((target, i) => {
          const state = slotStates[i];
          const text = getSlotText(i);
          const mora = getSlotMora(i);
          const valid = isSlotValid(mora, target);
          const over = jiari ? mora > target + 1 : mora > target;
          const isActive = activeSlot === i;
          const isPartsMode = state?.partText !== "";

          return (
            <div
              key={i}
              onClick={() => setActiveSlot(i)}
              className={`flex-1 rounded-xl pt-2 pb-1 border transition-all cursor-pointer flex flex-col items-center ${
                isTanka ? "px-1" : "px-2"
              } ${
                valid
                  ? "border-green-500 bg-green-50"
                  : isActive
                  ? isTanka
                    ? "border-[#E0852A] bg-[#E0852A]/10"
                    : "border-[#2C4A7C] bg-[#2C4A7C]/10"
                  : "border-[#D4C9B8] bg-white/60"
              }`}
            >
              <span
                className={`font-bold mb-1 ${isTanka ? "text-[9px] text-[#E0852A]" : "text-xs text-[#2C4A7C]"}`}
              >
                {config.labels[i]}
              </span>

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
                    value={state?.freeText ?? ""}
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

              <div className="flex items-center gap-0.5 mt-1">
                <span
                  className={`font-bold ${isTanka ? "text-[9px]" : "text-xs"} ${
                    valid ? "text-green-600" : over ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {mora}/{target}{valid && "✓"}
                </span>
                {text && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear(i);
                    }}
                    className="text-gray-300 hover:text-red-400 text-xs leading-none ml-0.5"
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

      {/* Jiari toggle */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setJiari(!jiari)}
          className={`text-xs px-2 py-1 rounded-lg border transition-all ${
            jiari
              ? "bg-amber-50 border-amber-400 text-amber-700 font-bold"
              : "bg-white/60 border-[#D4C9B8] text-gray-400"
          }`}
        >
          {jiari ? "字余り許可 ON" : "字余り許可 OFF"}
        </button>
        {jiari && (
          <span className="text-xs text-amber-600">各句±1音まで許容</span>
        )}
      </div>

      {/* Candidate panel */}
      <div className="bg-white/60 rounded-2xl p-4 border border-[#D4C9B8]">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-bold ${isTanka ? "text-[#E0852A]" : "text-[#2C4A7C]"}`}>候補</span>
          <button
            onClick={() => handleShuffle(activeSlot)}
            className={`text-sm underline ${isTanka ? "text-[#E0852A]" : "text-[#2C4A7C]"}`}
          >
            別の候補 ⟳
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {getCandidates(activeSlot).map((part) => (
            <button
              key={part.id}
              onClick={() => handlePartTap(part.text, part.mora)}
              className={`px-2.5 py-1 text-sm rounded-lg border transition-all active:scale-95 bg-white text-[#1A1A1A] ${
                isTanka
                  ? "border-[#E0852A]/30 hover:border-[#E0852A] hover:bg-[#E0852A]/5"
                  : "border-[#2C4A7C]/30 hover:border-[#2C4A7C] hover:bg-[#2C4A7C]/5"
              }`}
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
