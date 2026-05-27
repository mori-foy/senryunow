"use client";

import { create } from "zustand";
import { Part, getRandomParts } from "@/data/parts";

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

  tickTimer: () => void;
  expireTimer: () => void;
  setInputMode: (mode: InputMode) => void;
  resetRound: () => void;
  initCandidates: () => void;
  togglePartSelection: (slotIndex: 0 | 1 | 2, part: Part) => void;
  shuffleCandidates: (slotIndex: 0 | 1 | 2) => void;
  setTextInput: (text: string) => void;
  setPosted: () => void;
}

const emptySlot = (): SlotState => ({ candidates: [], selected: [] });

export const useAppStore = create<AppState>((set) => ({
  remainingSeconds: 300,
  isExpired: false,
  hasPosted: false,
  inputMode: "parts",
  slots: [emptySlot(), emptySlot(), emptySlot()],
  textInput: "",

  tickTimer: () =>
    set((state) => {
      if (state.remainingSeconds <= 1) {
        return { remainingSeconds: 0, isExpired: true };
      }
      return { remainingSeconds: state.remainingSeconds - 1 };
    }),

  expireTimer: () => set({ remainingSeconds: 0, isExpired: true }),

  setInputMode: (mode) => set({ inputMode: mode }),

  resetRound: () =>
    set({
      remainingSeconds: 300,
      isExpired: false,
      hasPosted: false,
      slots: [emptySlot(), emptySlot(), emptySlot()],
      textInput: "",
    }),

  initCandidates: () =>
    set({
      slots: [
        { candidates: getRandomParts(10, [], 5), selected: [] },
        { candidates: getRandomParts(10), selected: [] },
        { candidates: getRandomParts(10, [], 5), selected: [] },
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
      const maxMora = slotIndex === 1 ? undefined : 5;
      slot.candidates = getRandomParts(10, excludeIds, maxMora);
      slots[slotIndex] = slot;
      return { slots };
    }),

  setTextInput: (text) => set({ textInput: text }),

  setPosted: () => set({ hasPosted: true }),
}));
