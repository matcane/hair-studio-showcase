import { create } from "zustand";

import type { PendingLook } from "./types";

interface LooksStore {
  pendingLook: PendingLook | null;
  unseenReadyLookCount: number;
}

export const usePendingLookStore = create<LooksStore>(() => ({
  pendingLook: null,
  unseenReadyLookCount: 0,
}));

export function setPendingLook(option: PendingLook) {
  usePendingLookStore.setState({ pendingLook: option });
}

export function clearPendingLook() {
  usePendingLookStore.setState({ pendingLook: null });
}

export function markUnseenReadyLook() {
  usePendingLookStore.setState((state) => ({
    unseenReadyLookCount: state.unseenReadyLookCount + 1,
  }));
}

export function clearUnseenReadyLook() {
  usePendingLookStore.setState({ unseenReadyLookCount: 0 });
}
