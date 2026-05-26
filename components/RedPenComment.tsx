"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

function rotationForId(id: string): number {
  // Deterministic tilt based on comment ID — avoids SSR mismatch
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return ((hash % 300) - 150) / 100;
}

export default function RedPenComment({ postId }: { postId: string }) {
  const { posts, addRedPenComment } = useAppStore();
  const post = posts.find((p) => p.id === postId);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    addRedPenComment(postId, trimmed);
    setInput("");
    setIsOpen(false);
  };

  return (
    <div className="mt-2">
      {post?.redPenComments.map((comment) => (
        <div
          key={comment.id}
          className="mb-2 px-3 py-1.5 bg-red-50 border-l-4 border-[#C0392B] rounded-r-lg"
          style={{ transform: `rotate(${rotationForId(comment.id)}deg)` }}
        >
          <p
            className="text-sm text-[#C0392B] font-medium"
            style={{ fontFamily: "var(--font-kaisei)" }}
          >
            ✏️ {comment.text}
          </p>
          <p className="text-xs text-red-400 mt-0.5">— {comment.authorName}</p>
        </div>
      ))}

      {isOpen ? (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="例：これ昨日の俺やないかい"
            className="flex-1 px-3 py-1.5 text-sm border border-[#C0392B]/40 rounded-lg focus:outline-none focus:border-[#C0392B] bg-white"
            autoFocus
          />
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 bg-[#C0392B] text-white text-sm rounded-lg"
          >
            添削
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-2 py-1.5 text-gray-400 text-sm"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs text-[#C0392B] underline mt-1"
        >
          ✏️ 赤ペンで添削する
        </button>
      )}
    </div>
  );
}
