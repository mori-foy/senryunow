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
  Timestamp,
} from "firebase/firestore";

export interface FirestorePost {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  haiku: string;
  createdAt: Timestamp | null;
  date: string;
}

export interface FirestoreReaction {
  id: string;
  postId: string;
  uid: string;
  type: "stamp" | "redpen";
  emoji?: string;
  displayName?: string;
  comment?: string | null;
  createdAt: Timestamp | null;
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export function createPost(
  uid: string,
  displayName: string,
  photoURL: string,
  lines: [string, string, string]
) {
  return addDoc(collection(db, "posts"), {
    uid,
    displayName,
    photoURL,
    haiku: lines.join("／"),
    createdAt: serverTimestamp(),
    date: todayString(),
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
