"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/context/AuthContext";
import { subscribeTodayPosts, type FirestorePost } from "@/lib/firestore";

export default function FeedPage() {
  const router = useRouter();
  const { isExpired } = useAppStore();
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<FirestorePost[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeTodayPosts((p) => {
      setPosts(p);
      setPostsLoaded(true);
    });
    return unsub;
  }, [user]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </main>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const hasPostedToday = postsLoaded && posts.some((p) => p.uid === user.uid);
  const canView = hasPostedToday || !isExpired;

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
        <div className="w-20" />
        <Image
          src="/logo_senryunow.png"
          alt="川柳なう。"
          width={140}
          height={46}
          priority
        />
        <div className="w-20" />
      </div>

      {/* Posts with blur overlay if not posted yet */}
      <div className="relative flex-1">
        {/* Posts list */}
        <div className={hasPostedToday ? "" : "blur-sm pointer-events-none select-none"}>
          {posts.length === 0 ? (
            <p className="text-center text-gray-400 mt-12">まだ投稿がありません</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUid={user.uid}
                currentDisplayName={user.displayName ?? "名無し"}
              />
            ))
          )}
        </div>

        {/* Overlay: not posted yet */}
        {!hasPostedToday && postsLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="bg-white/90 rounded-3xl px-8 py-8 shadow-xl border border-[#D4C9B8] text-center mx-4">
              <p className="text-4xl mb-4">✍️</p>
              <h2
                className="text-xl font-bold text-[#1A1A1A] mb-2"
                style={{ fontFamily: "var(--font-kaisei)" }}
              >
                まだ今日の句を詠んでいません
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                投稿するとみんなの句が読めます
              </p>
              <button
                onClick={() => router.push("/")}
                className="w-full py-4 rounded-2xl text-base font-bold bg-[#3A7D55] text-white shadow-lg active:scale-95 transition-all duration-200"
                style={{ fontFamily: "var(--font-kaisei)" }}
              >
                本日の一句を詠む
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {!postsLoaded && (
          <p className="text-center text-gray-400 mt-12">読み込み中...</p>
        )}
      </div>
    </main>
  );
}
