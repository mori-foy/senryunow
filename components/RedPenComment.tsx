"use client";

import { useState, useEffect } from "react";
import {
  subscribeReactions,
  addRedPenComment,
  removeReaction,
  type FirestoreReaction,
} from "@/lib/firestore";

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
          className="mb-2 px-3 py-1.5 bg-red-50 border-l-4 border-[#C0392B] rounded-r-lg flex items-start justify-between gap-2"
        >
          <div>
            <p
              className="text-sm text-[#C0392B] font-medium"
              style={{ fontFamily: "var(--font-kaisei)" }}
            >
              ✏️ {comment.comment}
            </p>
            <p className="text-xs text-red-400 mt-0.5">— {comment.displayName}</p>
          </div>
          {comment.uid === currentUid && (
            <button
              onClick={() => removeReaction(comment.id)}
              className="text-red-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
              aria-label="削除"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          )}
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
