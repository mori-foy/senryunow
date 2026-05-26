"use client";

import StampButton from "./StampButton";
import RedPenComment from "./RedPenComment";
import { Post } from "@/data/mockPosts";

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  return `${Math.floor(diff / 3600)}時間前`;
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-white/70 rounded-2xl p-5 border border-[#D4C9B8] shadow-sm mb-4">
      {/* Author */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{post.avatar}</span>
        <div>
          <p className="font-medium text-[#1A1A1A] text-sm">{post.username}</p>
          <p className="text-xs text-gray-400">{formatTime(post.timestamp)}</p>
        </div>
      </div>

      {/* Senryu - vertical writing */}
      <div className="flex justify-center mb-4">
        <div
          className="flex flex-row-reverse gap-4 px-4"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            height: "140px",
          }}
        >
          {[...post.lines].reverse().map((line, i) => (
            <div
              key={i}
              className="text-xl text-[#1A1A1A] leading-relaxed"
              style={{ fontFamily: "var(--font-kaisei)" }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Reactions */}
      <div className="flex items-start gap-3 pt-3 border-t border-[#D4C9B8]/50">
        <StampButton postId={post.id} />
        <div className="flex-1">
          <RedPenComment postId={post.id} />
        </div>
      </div>
    </div>
  );
}
