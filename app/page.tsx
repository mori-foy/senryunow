"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CountdownTimer from "@/components/CountdownTimer";
import HaikuBuilder from "@/components/HaikuBuilder";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/lib/firestore";

export default function HomePage() {
  const router = useRouter();
  const { isExpired, hasPosted, setPosted } = useAppStore();
  const { user, loading, signInWithGoogle } = useAuth();

  const [isValid, setIsValid] = useState(false);
  const [pendingLines, setPendingLines] = useState<[string, string, string]>([
    "",
    "",
    "",
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocation("不明");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ja`,
            { headers: { "User-Agent": "senryunow/1.0" } }
          );
          const data = await res.json();
          const addr = data.address ?? {};
          const parts = [addr.state, addr.city ?? addr.town ?? addr.village].filter(Boolean);
          setLocation(parts.length > 0 ? parts.join(" ") : "不明");
        } catch {
          setLocation("不明");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocation("不明");
        setLocationLoading(false);
      }
    );
  };

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

  const handleSubmit = async () => {
    if (!isValid || isExpired || !user) return;
    setSubmitting(true);
    try {
      await createPost(
        user.uid,
        user.displayName ?? "名無し",
        user.photoURL ?? "",
        pendingLines,
        location
      );
      setPosted();
    } catch {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto">
        <Image
          src="/logo_senryunow.png"
          alt="川柳なう。"
          width={240}
          height={80}
          className="mx-auto mb-10"
          priority
        />
        <p className="text-gray-500 mb-8 text-sm text-center">
          今日の一句を詠むには<br />ログインしてください
        </p>
        <button
          onClick={signInWithGoogle}
          className="w-full max-w-xs py-4 rounded-2xl text-base font-bold bg-[#3A7D55] text-white shadow-lg active:scale-95 transition-all duration-200"
          style={{ fontFamily: "var(--font-kaisei)" }}
        >
          Googleでログイン
        </button>
      </main>
    );
  }

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
        <p className="text-xs text-gray-400 mt-0.5">ひらがなで入力すると文字数が正確に反映されます</p>
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

      {/* Location */}
      <div className="flex items-center gap-2 mt-3 mb-1">
        {location === null ? (
          <button
            onClick={handleGetLocation}
            disabled={locationLoading}
            className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-300 rounded-xl px-3 py-2 active:scale-95 transition-all"
          >
            <span>📍</span>
            <span>{locationLoading ? "取得中..." : "位置情報を付ける"}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-600 border border-[#3A7D55]/40 bg-[#3A7D55]/5 rounded-xl px-3 py-2">
            <span>📍</span>
            <span>{location}</span>
            <button
              onClick={() => setLocation(null)}
              className="ml-1 text-gray-400 text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isExpired || submitting}
        className={`w-full py-4 rounded-2xl text-lg font-bold transition-all duration-200 mt-2 ${
          isValid && !isExpired
            ? "bg-[#3A7D55] text-white shadow-lg active:scale-95"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
        style={{ fontFamily: "var(--font-kaisei)" }}
      >
        {submitting ? "詠んでいます..." : "この句を投稿する"}
      </button>
    </main>
  );
}
