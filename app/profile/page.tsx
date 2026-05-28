"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import {
  subscribeUserPosts,
  subscribePinnedPostId,
  subscribeReactions,
  setPinnedPost,
  deletePost,
  updateUserDisplayName,
  type FirestorePost,
  type FirestoreReaction,
} from "@/lib/firestore";
import PinnedPostCard from "@/components/PinnedPostCard";

function getStatus(count: number): string {
  if (count <= 5) return "みならい";
  if (count <= 10) return "一般人";
  if (count <= 15) return "一人前";
  if (count <= 20) return "玄人";
  return "宗匠";
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "みならい": return "text-gray-500 bg-gray-100";
    case "一般人":   return "text-blue-600 bg-blue-100";
    case "一人前":   return "text-[#3A7D55] bg-green-100";
    case "玄人":    return "text-purple-700 bg-purple-100";
    case "宗匠":    return "text-yellow-700 bg-yellow-100";
    default:        return "text-gray-500 bg-gray-100";
  }
}

function formatDate(dateStr: string, ts?: { seconds: number } | null): string {
  const [year, month, day] = dateStr.split("-");
  const date = `${year}年${Number(month)}月${Number(day)}日`;
  if (!ts) return date;
  const d = new Date(ts.seconds * 1000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${date} ${hh}:${mm}`;
}

function PostMiniCard({
  post,
  isPinned,
  onPin,
  onUnpin,
}: {
  post: FirestorePost;
  isPinned: boolean;
  onPin: () => void;
  onUnpin: () => void;
}) {
  const lines = post.haiku.split("／");
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reactions, setReactions] = useState<FirestoreReaction[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    return subscribeReactions(post.id, setReactions);
  }, [post.id]);

  const stamps = reactions.filter((r) => r.type === "stamp");
  const comments = reactions.filter((r) => r.type === "redpen");

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
    <div className="bg-white/70 rounded-xl p-2 border border-[#D4C9B8] shadow-sm flex flex-col overflow-hidden" style={{ height: "185px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-gray-400 leading-none">{formatDate(post.date, post.createdAt)}</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={isPinned ? onUnpin : onPin}
            className={`text-xs transition-colors ${isPinned ? "text-[#3A7D55]" : "text-gray-300 hover:text-[#3A7D55]"}`}
            aria-label={isPinned ? "ピン解除" : "マイベストにピン止め"}
          >
            📌
          </button>
          {confirming ? (
            <>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-[10px] text-white bg-red-500 px-1.5 py-0.5 rounded disabled:opacity-50"
              >
                {deleting ? "…" : "削除"}
              </button>
              <button
                onClick={() => { setConfirming(false); setError(null); }}
                className="text-[10px] text-gray-400"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-gray-300 hover:text-red-400 transition-colors"
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
      </div>
      {error && <p className="text-[10px] text-red-500 mb-1">{error}</p>}
      {/* Haiku — tap to open detail */}
      <button
        className="w-full flex-1 overflow-hidden"
        onClick={() => setDetailOpen(true)}
      >
        <div className="flex flex-row-reverse justify-center items-start gap-2 h-full">
          {lines.map((line, i) => (
            <div
              key={i}
              className="text-[#1A1A1A]"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontFamily: "var(--font-kaisei)",
                fontSize: "14px",
                lineHeight: 1.0,
                overflow: "hidden",
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </button>
      {/* Reactions summary */}
      {(stamps.length > 0 || comments.length > 0) && (
        <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-[#D4C9B8]/50">
          {stamps.map((s) => (
            <span key={s.id} className="text-xs">{s.emoji}</span>
          ))}
          {comments.length > 0 && (
            <span className="text-[10px] text-[#C0392B] ml-auto">✏️ {comments.length}</span>
          )}
        </div>
      )}

      {/* Detail modal */}
      {detailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="bg-[#F5F0E8] rounded-2xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-gray-400">{formatDate(post.date, post.createdAt)}</p>
              <button onClick={() => setDetailOpen(false)} className="text-gray-400 text-lg leading-none">✕</button>
            </div>
            {/* Haiku */}
            <div className="flex flex-row-reverse justify-center gap-6 mb-6" style={{ height: "140px" }}>
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="text-xl text-[#1A1A1A]"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    fontFamily: "var(--font-kaisei)",
                    lineHeight: 1.6,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
            {/* Stamps */}
            {stamps.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 mb-2">スタンプ</p>
                <div className="flex flex-col gap-1.5">
                  {stamps.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <span className="text-lg">{s.emoji}</span>
                      <span className="text-sm text-gray-700">{s.displayName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Red pen comments */}
            {comments.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 mb-2">赤ペン添削</p>
                <div className="flex flex-col gap-2">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-red-50 border-l-4 border-[#C0392B] rounded-r-lg px-3 py-2">
                      <p className="text-sm text-[#C0392B]" style={{ fontFamily: "var(--font-kaisei)" }}>
                        ✏️ {c.comment}
                      </p>
                      <p className="text-xs text-red-400 mt-0.5">— {c.displayName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {stamps.length === 0 && comments.length === 0 && (
              <p className="text-center text-sm text-gray-400">まだリアクションがありません</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut, refreshUser } = useAuth();
  const [posts, setPosts] = useState<FirestorePost[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [pinnedPostId, setPinnedPostId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubPosts = subscribeUserPosts(user.uid, (p) => {
      setPosts(p);
      setPostsLoaded(true);
    });
    const unsubPin = subscribePinnedPostId(user.uid, setPinnedPostId);
    return () => { unsubPosts(); unsubPin(); };
  }, [user]);

  const handlePin = async (postId: string) => {
    if (!user) return;
    await setPinnedPost(user.uid, postId);
  };

  const handleUnpin = async () => {
    if (!user) return;
    await setPinnedPost(user.uid, null);
  };

  const handleEditName = () => {
    setNameInput(user?.displayName ?? "");
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!user || !nameInput.trim()) return;
    setSavingName(true);
    const newName = nameInput.trim();
    await updateProfile(user, { displayName: newName });
    await updateUserDisplayName(user.uid, newName);
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

  const pinnedPost = posts.find((p) => p.id === pinnedPostId) ?? null;
  const unpinnedPosts = posts.filter((p) => p.id !== pinnedPostId);

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-[#D4C9B8]">
        <div className="flex items-center justify-between max-w-md mx-auto px-4 py-3">
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
      </div>
      {/* Content */}
      <div className="px-4 pt-20 pb-6">

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
        {postsLoaded && (
          <span className={`text-xs font-bold px-3 py-1 rounded-full mb-1 ${getStatusBadgeClass(getStatus(posts.length))}`}>
            {getStatus(posts.length)}
          </span>
        )}
        <p className="text-xs text-gray-400 mb-4 mt-1">{user.email}</p>
        <button onClick={handleSignOut} className="text-sm text-gray-400 underline">
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
            <span className="text-gray-400 font-normal ml-2">{posts.length}句</span>
          )}
        </h2>

        {!postsLoaded ? (
          <p className="text-center text-gray-400 mt-8">読み込み中...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 mt-8">まだ投稿がありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Pinned post at top */}
            {pinnedPost && (
              <PinnedPostCard post={pinnedPost} postCount={posts.length} />
            )}
            {/* Rest of posts — 2 column grid */}
            <div className="grid grid-cols-2 gap-3">
            {unpinnedPosts.map((post) => (
              <PostMiniCard
                key={post.id}
                post={post}
                isPinned={post.id === pinnedPostId}
                onPin={() => handlePin(post.id)}
                onUnpin={handleUnpin}
              />
            ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}
