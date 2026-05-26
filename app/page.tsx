"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CountdownTimer from "@/components/CountdownTimer";
import HaikuBuilder from "@/components/HaikuBuilder";
import { useAppStore } from "@/store/useAppStore";

export default function HomePage() {
  const router = useRouter();
  const { isExpired, hasPosted, submitPost } = useAppStore();

  const [isValid, setIsValid] = useState(false);
  const [pendingLines, setPendingLines] = useState<[string, string, string]>([
    "",
    "",
    "",
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hasPosted) {
      router.push("/feed");
    }
  }, [hasPosted, router]);

  const handleValidChange = useCallback(
    (valid: boolean, lines: [string, string, string]) => {
      setIsValid(valid);
      setPendingLines(lines);
    },
    []
  );

  const handleSubmit = () => {
    if (!isValid || isExpired) return;
    setSubmitting(true);
    submitPost(pendingLines);
    router.push("/feed");
  };

  if (isExpired && !hasPosted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-6xl mb-4">⏰</p>
          <h1
            className="text-2xl font-bold text-[#1A1A1A] mb-2"
            style={{ fontFamily: "var(--font-kaisei)" }}
          >
            今日の句は終わりました
          </h1>
          <p className="text-gray-500">また明日、川柳を詠んでください。</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-4 pt-16 pb-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <Image
          src="/logo_senryunow.png"
          alt="川柳なう。"
          width={240}
          height={80}
          className="mx-auto"
          priority
        />
        <p className="text-xs text-gray-400 mt-1">今日の一句を詠んでください</p>
      </div>

      {/* Countdown */}
      <CountdownTimer />

      {/* Input area */}
      <div className="flex-1">
        <HaikuBuilder onValidChange={handleValidChange} />
      </div>

      {/* Preview — vertical writing */}
      {isValid && (
        <div className="my-4 p-4 bg-white/70 rounded-2xl border border-[#D4C9B8] ink-appear">
          <p className="text-xs text-gray-400 mb-3 text-center">プレビュー</p>
          <div className="flex flex-row-reverse justify-center gap-6" style={{ height: "110px" }}>
            {pendingLines.map((line, i) => (
              <div
                key={i}
                className="text-xl text-[#1A1A1A] leading-loose"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  fontFamily: "var(--font-kaisei)",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isExpired || submitting}
        className={`w-full py-4 rounded-2xl text-lg font-bold transition-all duration-200 mt-2 ${
          isValid && !isExpired
            ? "bg-[#C0392B] text-white shadow-lg active:scale-95"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
        style={{ fontFamily: "var(--font-kaisei)" }}
      >
        {submitting ? "詠んでいます..." : "この句を投稿する"}
      </button>
    </main>
  );
}
