"use client";

import { create } from "zustand";
import { Part, getRandomParts } from "@/data/parts";
import { Post, Stamp, RedPenComment, initialMockPosts } from "@/data/mockPosts";

export interface SlotState {
  candidates: Part[];
  selected: Part[];
}

export type InputMode = "parts" | "text";

interface AppState {
  remainingSeconds: number;
  isExpired: boolean;
  hasPosted: boolean;
  inputMode: InputMode;
  slots: [SlotState, SlotState, SlotState];
  textInput: string;
  posts: Post[];

  tickTimer: () => void;
  expireTimer: () => void;
  setInputMode: (mode: InputMode) => void;
  initCandidates: () => void;
  togglePartSelection: (slotIndex: 0 | 1 | 2, part: Part) => void;
  shuffleCandidates: (slotIndex: 0 | 1 | 2) => void;
  setTextInput: (text: string) => void;
  submitPost: (lines: [string, string, string]) => void;
  addStamp: (postId: string, emoji: string) => void;
  removeStamp: (postId: string) => void;
  addRedPenComment: (postId: string, text: string) => void;
}

const emptySlot = (): SlotState => ({ candidates: [], selected: [] });

export const useAppStore = create<AppState>((set) => ({
  remainingSeconds: 300,
  isExpired: false,
  hasPosted: false,
  inputMode: "parts",
  // Start with empty candidates — populated client-side via initCandidates()
  slots: [emptySlot(), emptySlot(), emptySlot()],
  textInput: "",
  posts: initialMockPosts.map((p) => ({ ...p })),

  tickTimer: () =>
    set((state) => {
      if (state.remainingSeconds <= 1) {
        return { remainingSeconds: 0, isExpired: true };
      }
      return { remainingSeconds: state.remainingSeconds - 1 };
    }),

  expireTimer: () => set({ remainingSeconds: 0, isExpired: true }),

  setInputMode: (mode) => set({ inputMode: mode }),

  initCandidates: () =>
    set({
      slots: [
        { candidates: getRandomParts(10), selected: [] },
        { candidates: getRandomParts(10), selected: [] },
        { candidates: getRandomParts(10), selected: [] },
      ],
    }),

  togglePartSelection: (slotIndex, part) =>
    set((state) => {
      const slots = [...state.slots] as [SlotState, SlotState, SlotState];
      const slot = { ...slots[slotIndex] };
      const alreadySelected = slot.selected.find((p) => p.id === part.id);
      if (alreadySelected) {
        slot.selected = slot.selected.filter((p) => p.id !== part.id);
      } else {
        slot.selected = [...slot.selected, part];
      }
      slots[slotIndex] = slot;
      return { slots };
    }),

  shuffleCandidates: (slotIndex) =>
    set((state) => {
      const slots = [...state.slots] as [SlotState, SlotState, SlotState];
      const slot = { ...slots[slotIndex] };
      const excludeIds = slot.selected.map((p) => p.id);
      slot.candidates = getRandomParts(10, excludeIds);
      slots[slotIndex] = slot;
      return { slots };
    }),

  setTextInput: (text) => set({ textInput: text }),

  submitPost: (lines) => {
    const newPost: Post = {
      id: `post-me-${Date.now()}`,
      userId: "me",
      username: "あなた",
      avatar: "🧑",
      lines,
      timestamp: new Date(),
      stamps: [],
      redPenComments: [],
    };
    set((state) => ({
      hasPosted: true,
      posts: [newPost, ...state.posts],
    }));
  },

  addStamp: (postId, emoji) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        // Replace existing stamp from "あなた" (one reaction per user)
        const filtered = p.stamps.filter((s) => s.username !== "あなた");
        const newStamp: Stamp = { emoji, username: "あなた" };
        return { ...p, stamps: [...filtered, newStamp] };
      }),
    })),

  removeStamp: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, stamps: p.stamps.filter((s) => s.username !== "あなた") }
          : p
      ),
    })),

  addRedPenComment: (postId, text) => {
    const comment: RedPenComment = {
      id: `rpc-${Date.now()}`,
      authorId: "me",
      authorName: "あなた",
      text,
      timestamp: new Date(),
    };
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, redPenComments: [...p.redPenComments, comment] }
          : p
      ),
    }));
  },
}));
