"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

const STAMP_OPTIONS = ["🈴", "💯", "😂", "🥲"];
const MY_USERNAME = "あなた";

export default function StampButton({ postId }: { postId: string }) {
  const { posts, addStamp, removeStamp } = useAppStore();
  const post = posts.find((p) => p.id === postId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const myStamp = post?.stamps.find((s) => s.username === MY_USERNAME);

  // Close picker on outside click
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

  const handleSelect = (emoji: string) => {
    if (myStamp?.emoji === emoji) {
      removeStamp(postId);
    } else {
      addStamp(postId, emoji);
    }
    setPickerOpen(false);
  };

  if (!post) return null;

  return (
    <div className="flex flex-wrap items-end gap-2">
      {/* Existing stamps */}
      {post.stamps.map((stamp, i) => (
        <button
          key={i}
          onClick={() => stamp.username === MY_USERNAME && handleSelect(stamp.emoji)}
          className={`flex flex-col items-center gap-0.5 transition-transform active:scale-90 ${
            stamp.username === MY_USERNAME ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-full text-xl border-2 ${
              stamp.username === MY_USERNAME
                ? "border-[#C0392B] bg-[#C0392B]/10"
                : "border-gray-200 bg-white"
            }`}
          >
            {stamp.emoji}
          </span>
          <span className="text-[10px] text-gray-400 leading-none max-w-[40px] truncate">
            {stamp.username}
          </span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="flex flex-col items-center gap-0.5"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full text-lg border-2 border-dashed border-gray-300 bg-white text-gray-400 hover:border-gray-400 transition-colors">
            +
          </span>
          <span className="text-[10px] text-transparent leading-none">_</span>
        </button>

        {/* Emoji picker */}
        {pickerOpen && (
          <div className="absolute bottom-14 left-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 flex gap-1 z-20">
            {STAMP_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSelect(emoji)}
                className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all active:scale-90 ${
                  myStamp?.emoji === emoji
                    ? "bg-[#C0392B]/10 ring-2 ring-[#C0392B]"
                    : "hover:bg-gray-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
