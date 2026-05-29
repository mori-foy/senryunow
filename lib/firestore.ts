import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getCountFromServer,
  getDocs,
  writeBatch,
  setDoc,
  Timestamp,
} from "firebase/firestore";

export interface FirestorePost {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  haiku: string;
  mode?: "senryu" | "tanka";
  jiari?: boolean;
  createdAt: Timestamp | null;
  date: string;
  location?: string | null;
}

export interface FirestoreReaction {
  id: string;
  postId: string;
  uid: string;
  type: "stamp" | "redpen" | "reply";
  emoji?: string;
  displayName?: string;
  comment?: string | null;
  parentId?: string | null;
  threadId?: string | null;
  createdAt: Timestamp | null;
}

function todayString() {
  const now = new Date();
  // JST (UTC+9) に変換し、15:00 JST を日付の境界にする
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  if (jst.getUTCHours() < 15) {
    // 15:00 より前は前日の期間扱い
    jst.setUTCDate(jst.getUTCDate() - 1);
  }
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function createPost(
  uid: string,
  displayName: string,
  photoURL: string,
  lines: string[],
  mode: "senryu" | "tanka" = "senryu",
  jiari: boolean = false,
  location?: string | null
) {
  return addDoc(collection(db, "posts"), {
    uid,
    displayName,
    photoURL,
    haiku: lines.join("／"),
    mode,
    jiari,
    createdAt: serverTimestamp(),
    date: todayString(),
    location: location ?? null,
  });
}

export function subscribeTodayPosts(
  callback: (posts: FirestorePost[]) => void
) {
  const q = query(
    collection(db, "posts"),
    where("date", "==", todayString())
  );
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FirestorePost, "id">),
    }));
    posts.sort((a, b) => {
      const at = a.createdAt?.seconds ?? 0;
      const bt = b.createdAt?.seconds ?? 0;
      return bt - at;
    });
    callback(posts);
  });
}

export function subscribeReactions(
  postId: string,
  callback: (reactions: FirestoreReaction[]) => void
) {
  const q = query(
    collection(db, "reactions"),
    where("postId", "==", postId)
  );
  return onSnapshot(q, (snapshot) => {
    const reactions = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FirestoreReaction, "id">),
    }));
    callback(reactions);
  });
}

export function addStamp(
  postId: string,
  uid: string,
  displayName: string,
  emoji: string
) {
  return addDoc(collection(db, "reactions"), {
    postId,
    uid,
    type: "stamp",
    emoji,
    displayName,
    createdAt: serverTimestamp(),
  });
}

export function removeReaction(reactionId: string) {
  return deleteDoc(doc(db, "reactions", reactionId));
}

export function subscribePinnedPostId(
  uid: string,
  callback: (postId: string | null) => void
) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    callback((snap.data()?.pinnedPostId as string) ?? null);
  });
}

export async function setPinnedPost(uid: string, postId: string | null) {
  await setDoc(doc(db, "users", uid), { pinnedPostId: postId }, { merge: true });
}

export async function updateUserDisplayName(uid: string, displayName: string) {
  const batch = writeBatch(db);

  const postsSnap = await getDocs(
    query(collection(db, "posts"), where("uid", "==", uid))
  );
  postsSnap.docs.forEach((d) => batch.update(d.ref, { displayName }));

  const reactionsSnap = await getDocs(
    query(collection(db, "reactions"), where("uid", "==", uid))
  );
  reactionsSnap.docs.forEach((d) => batch.update(d.ref, { displayName }));

  await batch.commit();
}

export async function getUserPostCount(uid: string): Promise<number> {
  const q = query(collection(db, "posts"), where("uid", "==", uid));
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

export function deletePost(postId: string) {
  return deleteDoc(doc(db, "posts", postId));
}

export function subscribeUserPosts(
  uid: string,
  callback: (posts: FirestorePost[]) => void
) {
  const q = query(collection(db, "posts"), where("uid", "==", uid));
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FirestorePost, "id">),
    }));
    posts.sort((a, b) => {
      const at = a.createdAt?.seconds ?? 0;
      const bt = b.createdAt?.seconds ?? 0;
      return bt - at;
    });
    callback(posts);
  });
}

export function addReply(
  postId: string,
  uid: string,
  displayName: string,
  comment: string,
  parentId: string,
  threadId: string
) {
  return addDoc(collection(db, "reactions"), {
    postId,
    uid,
    type: "reply",
    comment,
    displayName,
    parentId,
    threadId,
    createdAt: serverTimestamp(),
  });
}

export function addRedPenComment(
  postId: string,
  uid: string,
  displayName: string,
  comment: string
) {
  return addDoc(collection(db, "reactions"), {
    postId,
    uid,
    type: "redpen",
    comment,
    displayName,
    createdAt: serverTimestamp(),
  });
}
