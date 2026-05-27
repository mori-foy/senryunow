"use client";

import { useState, useRef, useEffect } from "react";
import {
  subscribeReactions,
  addStamp,
  removeReaction,
  type FirestoreReaction,
} from "@/lib/firestore";

const STAMP_OPTIONS = ["🈴️", "💯", "😂", "🥲", "🌸", "❤️", "🔥"];

export default function StampButton({
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
  const [stamps, setStamps] = useState<FirestoreReaction[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeReactions(postId, (reactions) => {
      setStamps(reactions.filter((r) => r.type === "stamp"));
    });
  }, [postId]);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  const myStamp = stamps.find((s) => s.uid === currentUid);

  const handleSelect = async (emoji: string) => {
    setPickerOpen(false);
    if (myStamp?.emoji === emoji) {
      await removeReaction(myStamp.id);
    } else {
      if (myStamp) await removeReaction(myStamp.id);
      await addStamp(postId, currentUid, currentDisplayName, emoji);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {stamps.map((stamp) => (
        <button
          key={stamp.id}
          onClick={() => { if (stamp.uid === currentUid) handleSelect(stamp.emoji!); }}
          className={`flex flex-col items-center gap-0.5 transition-transform active:scale-90 ${
            stamp.uid === currentUid ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-full text-xl border-2 ${
              stamp.uid === currentUid
                ? "border-[#3A7D55] bg-[#3A7D55]/10"
                : "border-gray-200 bg-white"
            }`}
          >
            {stamp.emoji}
          </span>
          <span className="text-[10px] text-gray-400 leading-none max-w-[40px] truncate">
            {stamp.displayName}
          </span>
        </button>
      ))}

      {!isOwnPost && (
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="flex flex-col items-center gap-0.5"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full text-lg border-2 border-dashed border-gray-300 bg-white text-gray-400 hover:border-gray-400 transition-colors">
            +
          </span>
        </button>

        {pickerOpen && (
          <div className="absolute bottom-14 left-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 flex flex-nowrap gap-1 z-20">
            {STAMP_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSelect(emoji)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all active:scale-90 ${
                  myStamp?.emoji === emoji
                    ? "bg-[#3A7D55]/10 ring-2 ring-[#3A7D55]"
                    : "hover:bg-gray-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
