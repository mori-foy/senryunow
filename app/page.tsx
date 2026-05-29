"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CountdownTimer from "@/components/CountdownTimer";
import HaikuBuilder from "@/components/HaikuBuilder";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/lib/firestore";

function detectInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Line\/|Instagram|FBAN|FBAV|Twitter|Snapchat/i.test(ua)) return true;
  if (/iPhone|iPad|iPod/.test(ua) && !/Safari/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua)) return true;
  if (/Android/.test(ua) && /wv/.test(ua)) return true;
  return false;
}

export default function HomePage() {
  const router = useRouter();
  const { isExpired, hasPosted, setPosted } = useAppStore();
  const { user, loading, signInWithGoogle } = useAuth();

  const [isValid, setIsValid] = useState(false);
  const [pendingLines, setPendingLines] = useState<string[]>(["", "", ""]);
  const [poemMode, setPoemMode] = useState<"senryu" | "tanka">("senryu");
  const [jiari, setJiari] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInAppBrowser(detectInAppBrowser());
  }, []);

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
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ja`
          );
          const data = await res.json();
          const prefecture = data.principalSubdivision ?? "";
          const city = data.city ?? "";
          const locality = data.locality ?? "";
          const parts = [...new Set([prefecture, city, locality].filter(Boolean))];
          setLocation(parts.length > 0 ? parts.join(" ") : "不明");
        } catch {
          setLocation("不明");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocation("不明");
        setLocationLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleValidChange = useCallback(
    (valid: boolean, lines: string[], mode: "senryu" | "tanka", newJiari: boolean) => {
      setIsValid(valid);
      setPendingLines(lines);
      setPoemMode(mode);
      setJiari(newJiari);
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
        poemMode,
        jiari,
        location
      );
      setPosted();
      router.push("/feed");
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
    const handleCopyUrl = async () => {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

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
        {inAppBrowser ? (
          <>
            <div className="w-full max-w-xs bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-6 text-center">
              <p className="text-amber-800 text-sm font-bold mb-2">
                アプリ内ブラウザでは<br />Googleログインができません
              </p>
              <p className="text-amber-700 text-xs">
                SafariまたはChromeで開いてください
              </p>
            </div>
            <button
              onClick={handleCopyUrl}
              className="w-full max-w-xs py-4 rounded-2xl text-base font-bold bg-[#3A7D55] text-white shadow-lg active:scale-95 transition-all duration-200"
              style={{ fontFamily: "var(--font-kaisei)" }}
            >
              {copied ? "コピーしました！" : "URLをコピーする"}
            </button>
            <p className="text-xs text-gray-400 mt-4 text-center">
              コピーしたURLをSafariのアドレスバーに貼り付けて開いてください
            </p>
          </>
        ) : (
          <>
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
          </>
        )}
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
          <div
            className="flex flex-row-reverse justify-center gap-6"
            style={{ height: poemMode === "tanka" ? "160px" : "110px" }}
          >
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
            <span>{locationLoading ? "取得中..." : "位置情報を取得する"}</span>
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
