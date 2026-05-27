"use client";

import { useState, useEffect } from "react";
import {
  subscribeReactions,
  addRedPenComment,
  type FirestoreReaction,
} from "@/lib/firestore";

function rotationForId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return ((hash % 300) - 150) / 100;
}

export default function RedPenComment({
  postId,
  currentUid,
  currentDisplayName,
  isOwnPost,
}: {
  postId: string;
  currentUid: string;
  currentDisplayName: string;
  isOwnPost: boolean;
}) {
  const [comments, setComments] = useState<FirestoreReaction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    return subscribeReactions(postId, (reactions) => {
      const sorted = reactions
        .filter((r) => r.type === "redpen")
        .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
      setComments(sorted);
    });
  }, [postId]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    setIsOpen(false);
    await addRedPenComment(postId, currentUid, currentDisplayName, trimmed);
  };

  return (
    <div className="mt-2">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="mb-2 px-3 py-1.5 bg-red-50 border-l-4 border-[#C0392B] rounded-r-lg"
          style={{ transform: `rotate(${rotationForId(comment.id)}deg)` }}
        >
          <p
            className="text-sm text-[#C0392B] font-medium"
            style={{ fontFamily: "var(--font-kaisei)" }}
          >
            ✏️ {comment.comment}
          </p>
          <p className="text-xs text-red-400 mt-0.5">— {comment.displayName}</p>
        </div>
      ))}

      {!isOwnPost && isOpen ? (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="例：これ昨日の俺やないかい"
            className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-[#C0392B]/40 rounded-lg focus:outline-none focus:border-[#C0392B] bg-white"
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
      ) : !isOwnPost ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs text-[#C0392B] underline mt-1"
        >
          ✏️ 赤ペンで添削する
        </button>
      ) : null}
    </div>
  );
}
