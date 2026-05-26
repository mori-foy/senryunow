"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function StampButton({ postId }: { postId: string }) {
  const { posts, addStamp, removeStamp } = useAppStore();
  const post = posts.find((p) => p.id === postId);
  const isStamped = post?.stamps.includes("me") ?? false;
  const [animating, setAnimating] = useState(false);

  const handleStamp = () => {
    if (animating) return;
    if (isStamped) {
      removeStamp(postId);
    } else {
      setAnimating(true);
      addStamp(postId);
      setTimeout(() => setAnimating(false), 400);
    }
  };

  return (
    <button
      onClick={handleStamp}
      className={`relative flex items-center justify-center w-14 h-14 rounded-full border-4 transition-all duration-200 select-none ${
        isStamped
          ? "border-[#C0392B] bg-[#C0392B]/10"
          : "border-[#C0392B]/40 bg-white hover:border-[#C0392B]/80"
      } ${animating ? "scale-125 -rotate-12" : "scale-100 rotate-0"}`}
      title="合格スタンプ"
    >
      <span
        className={`text-xs font-bold leading-tight text-center ${
          isStamped ? "text-[#C0392B]" : "text-[#C0392B]/50"
        }`}
        style={{ fontSize: "11px", lineHeight: "1.2" }}
      >
        合格
      </span>
    </button>
  );
}
