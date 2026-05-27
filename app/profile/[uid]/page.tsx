"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { subscribeUserPosts, subscribePinnedPostId, type FirestorePost } from "@/lib/firestore";
import PinnedPostCard from "@/components/PinnedPostCard";

function getStatus(count: number): string {
  if (count <= 5) return "みならい";
  if (count <= 10) return "一般人";
  if (count <= 15) return "一人前";
  if (count <= 20) return "玄人";
  return "宗匠";
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

function PostMiniCard({ post }: { post: FirestorePost }) {
  const lines = post.haiku.split("／");
  return (
    <div className="bg-white/70 rounded-xl p-3 border border-[#D4C9B8] shadow-sm">
      <p className="text-[10px] text-gray-400 mb-2">{formatDate(post.date)}</p>
      <div className="flex flex-row-reverse justify-center gap-3" style={{ height: "160px" }}>
        {lines.map((line, i) => (
          <div
            key={i}
            className="text-sm text-[#1A1A1A]"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              fontFamily: "var(--font-kaisei)",
              lineHeight: 1.6,
              overflow: "hidden",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<FirestorePost[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [pinnedPostId, setPinnedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (user && uid === user.uid) {
      router.replace("/profile");
      return;
    }
    const unsubPosts = subscribeUserPosts(uid, (p) => {
      setPosts(p);
      setPostsLoaded(true);
    });
    const unsubPin = subscribePinnedPostId(uid, setPinnedPostId);
    return () => { unsubPosts(); unsubPin(); };
  }, [uid, user, router]);

  const displayName = posts[0]?.displayName ?? "ユーザー";
  const photoURL = posts[0]?.photoURL ?? "";

  return (
    <main className="min-h-screen flex flex-col px-4 py-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          ←
        </button>
        <span
          className="text-base font-bold text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-kaisei)" }}
        >
          プロフィール
        </span>
        <div className="w-10" />
      </div>

      {/* User info */}
      <div className="flex flex-col items-center py-6 mb-6 bg-white/70 rounded-2xl border border-[#D4C9B8]">
        {photoURL ? (
          <Image
            src={photoURL}
            alt={displayName}
            width={72}
            height={72}
            className="rounded-full mb-3"
          />
        ) : (
          <div className="w-18 h-18 rounded-full bg-gray-200 flex items-center justify-center text-2xl mb-3">
            {displayName[0] ?? "?"}
          </div>
        )}
        <p
          className="text-lg font-bold text-[#1A1A1A] mb-2"
          style={{ fontFamily: "var(--font-kaisei)" }}
        >
          {displayName}
        </p>
        {postsLoaded && (
          <span className="text-xs font-bold text-[#3A7D55] bg-[#3A7D55]/10 px-3 py-1 rounded-full">
            {getStatus(posts.length)}
          </span>
        )}
      </div>

      {/* Past posts */}
      <div>
        <h2
          className="text-sm font-bold text-[#1A1A1A] mb-3"
          style={{ fontFamily: "var(--font-kaisei)" }}
        >
          過去の句
          {postsLoaded && (
            <span className="text-gray-400 font-normal ml-2">{posts.length}句</span>
          )}
        </h2>

        {!postsLoaded ? (
          <p className="text-center text-gray-400 mt-8">読み込み中...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 mt-8">まだ投稿がありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pinnedPostId && posts.find((p) => p.id === pinnedPostId) && (
              <PinnedPostCard
                post={posts.find((p) => p.id === pinnedPostId)!}
                postCount={posts.length}
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              {posts
                .filter((p) => p.id !== pinnedPostId)
                .map((post) => (
                  <PostMiniCard key={post.id} post={post} />
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
