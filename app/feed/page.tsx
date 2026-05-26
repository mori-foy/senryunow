"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import PostCard from "@/components/PostCard";
import { useAppStore } from "@/store/useAppStore";

export default function FeedPage() {
  const router = useRouter();
  const { isExpired, hasPosted, posts } = useAppStore();

  // If timer expired and user hasn't posted, they shouldn't be on this page
  const canView = hasPosted || !isExpired;

  if (!canView) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-6xl mb-4">📜</p>
          <h1
            className="text-2xl font-bold text-[#1A1A1A] mb-2"
            style={{ fontFamily: "var(--font-kaisei)" }}
          >
            今日の句はもう終わりました
          </h1>
          <p className="text-gray-500">また明日。</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-4 py-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-[#2C4A7C] underline"
        >
          ← 戻る
        </button>
        <Image
          src="/logo_senryunow.png"
          alt="川柳なう。"
          width={140}
          height={46}
          priority
        />
        <div className="w-12" />
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-400 mt-12">まだ投稿がありません</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </main>
  );
}
