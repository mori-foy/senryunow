"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { toKanji } from "@/lib/kanjiNumber";

export default function CountdownTimer() {
  const { remainingSeconds, isExpired, tickTimer } = useAppStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isExpired) return;
    intervalRef.current = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isExpired, tickTimer]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr = toKanji(
    `${String(minutes).padStart(2, "0")}：${String(seconds).padStart(2, "0")}`
  );

  const isUrgent = remainingSeconds <= 60 && !isExpired;
  const isCritical = remainingSeconds <= 30 && !isExpired;

  if (isExpired) {
    return (
      <div className="text-center py-2">
        <span className="text-2xl font-bold text-red-600 font-mono">時間切れ</span>
      </div>
    );
  }

  return (
    <div className="text-center py-2">
      <span
        className={`text-4xl font-bold font-mono tracking-widest transition-colors duration-300 ${
          isCritical
            ? "text-red-600 animate-pulse"
            : isUrgent
            ? "text-red-500"
            : "text-[#2C4A7C]"
        }`}
      >
        {timeStr}
      </span>
    </div>
  );
}
