"use client";

import { useRouter } from "next/navigation";
import StampButton from "./StampButton";
import RedPenComment from "./RedPenComment";
import UserAvatar from "./UserAvatar";
import { type FirestorePost } from "@/lib/firestore";

function formatTime(ts: { seconds: number } | null): string {
  if (!ts) return "";
  const date = new Date(ts.seconds * 1000);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const clock = `(${hh}:${mm})`;
  if (diff < 60) return `${diff}秒前 ${clock}`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前 ${clock}`;
  return `${Math.floor(diff / 3600)}時間前 ${clock}`;
}

export default function PostCard({
  post,
  currentUid,
  currentDisplayName,
}: {
  post: FirestorePost;
  currentUid: string;
  currentDisplayName: string;
}) {
  const router = useRouter();
  const lines = post.haiku.split("／");
  const isTanka = post.mode === "tanka";
  const isOwnPost = post.uid === currentUid;

  return (
    <div className="bg-white/70 rounded-2xl p-5 border border-[#D4C9B8] shadow-sm mb-4">
      {/* Author */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => !isOwnPost && router.push(`/profile/${post.uid}`)}
            className={isOwnPost ? "cursor-default" : "active:scale-95 transition-transform"}
          >
            <UserAvatar
              uid={post.uid}
              photoURL={post.photoURL}
              displayName={post.displayName}
              size={36}
            />
          </button>
          <div>
            <p className="font-medium text-[#1A1A1A] text-sm">{post.displayName}</p>
            <p className="text-xs text-gray-400">{formatTime(post.createdAt)}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          📍 {post.location ?? "不明"}
        </p>
      </div>

      {/* Badges */}
      {(isTanka || post.jiari) && (
        <div className="flex gap-1.5 mb-2">
          {isTanka && (
            <span className="text-xs bg-[#8B6914]/10 border border-[#8B6914]/30 text-[#8B6914] rounded px-1.5 py-0.5">
              短歌
            </span>
          )}
          {post.jiari && (
            <span className="text-xs bg-amber-50 border border-amber-300 text-amber-700 rounded px-1.5 py-0.5">
              字余り
            </span>
          )}
        </div>
      )}

      {/* Senryu / Tanka - vertical writing */}
      <div
        className="flex flex-row-reverse justify-center gap-6 mb-4 px-4 pt-5 rounded-xl overflow-hidden"
        style={{
          height: isTanka ? "240px" : "180px",
          backgroundImage: "url('/background_wasi.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className="text-xl text-[#1A1A1A] leading-relaxed"
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

      {/* Reactions */}
      <div className="pt-3 border-t border-[#D4C9B8]/50 space-y-3">
        <StampButton postId={post.id} currentUid={currentUid} currentDisplayName={currentDisplayName} isOwnPost={isOwnPost} />
        <RedPenComment postId={post.id} currentUid={currentUid} currentDisplayName={currentDisplayName} isOwnPost={isOwnPost} />
      </div>
    </div>
  );
}
