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
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  return `${Math.floor(diff / 3600)}時間前`;
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
  const lines = post.haiku.split("／") as [string, string, string];
  const isOwnPost = post.uid === currentUid;

  return (
    <div className="bg-white/70 rounded-2xl p-5 border border-[#D4C9B8] shadow-sm mb-4">
      {/* Author */}
      <div className="flex items-center gap-2 mb-4">
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

      {/* Senryu - vertical writing */}
      <div
        className="flex flex-row-reverse justify-center gap-6 mb-4 px-4"
        style={{ height: "140px" }}
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
        <StampButton postId={post.id} currentUid={currentUid} isOwnPost={isOwnPost} />
        <RedPenComment postId={post.id} currentUid={currentUid} currentDisplayName={currentDisplayName} isOwnPost={isOwnPost} />
      </div>
    </div>
  );
}
