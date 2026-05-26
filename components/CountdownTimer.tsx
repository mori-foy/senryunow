"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function CountdownTimer() {
  const { remainingSeconds, isExpired, tickTimer } = useAppStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isExpired) return;
    intervalRef.current = setInterval(() => tickTimer(), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isExpired, tickTimer]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progress = remainingSeconds / 300;

  const isUrgent = remainingSeconds <= 60 && !isExpired;
  const isCritical = remainingSeconds <= 30 && !isExpired;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div
          className={`h-full transition-all duration-1000 ${
            isCritical ? "bg-red-500" : isUrgent ? "bg-orange-400" : "bg-[#2C4A7C]"
          }`}
          style={{ width: `${Math.max(0, progress * 100)}%` }}
        />
      </div>

      {/* Timer bar */}
      <div className="bg-[#3A7D55] px-4 py-2 flex justify-center items-center max-w-md mx-auto w-full">
        {isExpired ? (
          <span className="text-base font-bold text-white font-mono">時間切れ</span>
        ) : (
          <span
            className={`text-base font-bold font-mono tracking-widest transition-colors ${
              isCritical ? "text-red-300 animate-pulse" : isUrgent ? "text-orange-200" : "text-white"
            }`}
          >
            ⏱ {timeStr}
          </span>
        )}
      </div>
    </div>
  );
}
