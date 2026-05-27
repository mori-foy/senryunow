"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { subscribeUserPosts, deletePost, type FirestorePost } from "@/lib/firestore";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

function PostMiniCard({ post }: { post: FirestorePost }) {
  const lines = post.haiku.split("／");
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deletePost(post.id);
    } catch (e) {
      console.error(e);
      setError("削除できませんでした");
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="bg-white/70 rounded-2xl p-4 border border-[#D4C9B8] shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">{formatDate(post.date)}</p>
        {confirming ? (
          <div className="flex items-center gap-2">
            {error && <span className="text-xs text-red-500">{error}</span>}
            {!error && <span className="text-xs text-gray-500">削除しますか？</span>}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-white bg-red-500 px-2 py-0.5 rounded disabled:opacity-50"
            >
              {deleting ? "削除中..." : "削除"}
            </button>
            <button
              onClick={() => { setConfirming(false); setError(null); }}
              className="text-xs text-gray-400"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-gray-300 hover:text-red-400 transition-colors"
            aria-label="削除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        )}
      </div>
      <div
        className="flex flex-row-reverse justify-center gap-5"
        style={{ height: "100px" }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className="text-lg text-[#1A1A1A] leading-relaxed"
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
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut, refreshUser } = useAuth();
  const [posts, setPosts] = useState<FirestorePost[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserPosts(user.uid, (p) => {
      setPosts(p);
      setPostsLoaded(true);
    });
    return unsub;
  }, [user]);

  const handleEditName = () => {
    setNameInput(user?.displayName ?? "");
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!user || !nameInput.trim()) return;
    setSavingName(true);
    await updateProfile(user, { displayName: nameInput.trim() });
    await refreshUser();
    setSavingName(false);
    setEditingName(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

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
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName ?? ""}
            width={72}
            height={72}
            className="rounded-full mb-3"
          />
        ) : (
          <div className="w-18 h-18 rounded-full bg-gray-200 flex items-center justify-center text-2xl mb-3">
            {user.displayName?.[0] ?? "?"}
          </div>
        )}
        {editingName ? (
          <div className="flex items-center gap-2 mb-1">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              maxLength={20}
              className="text-center text-base border border-[#3A7D55] rounded-lg px-3 py-1.5 focus:outline-none w-40"
              autoFocus
            />
            <button
              onClick={handleSaveName}
              disabled={savingName || !nameInput.trim()}
              className="px-3 py-1.5 bg-[#3A7D55] text-white text-sm rounded-lg disabled:opacity-50"
            >
              {savingName ? "保存中" : "保存"}
            </button>
            <button
              onClick={() => setEditingName(false)}
              className="text-gray-400 text-sm px-1"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-1">
            <p
              className="text-lg font-bold text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-kaisei)" }}
            >
              {user.displayName}
            </p>
            <button
              onClick={handleEditName}
              className="text-xs text-gray-400 border border-gray-300 rounded px-1.5 py-0.5 hover:border-gray-400 transition-colors"
            >
              編集
            </button>
          </div>
        )}
        <p className="text-xs text-gray-400 mb-4">{user.email}</p>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-400 underline"
        >
          ログアウト
        </button>
      </div>

      {/* Past posts */}
      <div className="mb-4">
        <h2
          className="text-sm font-bold text-[#1A1A1A] mb-3"
          style={{ fontFamily: "var(--font-kaisei)" }}
        >
          過去の句
          {postsLoaded && (
            <span className="text-gray-400 font-normal ml-2">
              {posts.length}句
            </span>
          )}
        </h2>

        {!postsLoaded ? (
          <p className="text-center text-gray-400 mt-8">読み込み中...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 mt-8">まだ投稿がありません</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {posts.map((post) => (
              <PostMiniCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
