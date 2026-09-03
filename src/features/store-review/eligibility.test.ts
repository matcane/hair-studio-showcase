import { globalStorage } from "@/services/storage";

import {
  canPromptForStoreReview,
  GATE_COOLDOWN_MS,
  LAST_GATE_AT_KEY,
  NATIVE_ATTEMPTS_KEY,
  NATIVE_WINDOW_MS,
  nativeAttemptsInWindow,
} from "./eligibility";

jest.mock("@/services/storage", () => {
  const data = new Map<string, string>();
  return {
    globalStorage: {
      getString: (key: string) => data.get(key),
      set: (key: string, value: string) => {
        data.set(key, value);
      },
      remove: (key: string) => {
        data.delete(key);
      },
    },
  };
});

const now = 1_700_000_000_000;

afterEach(() => {
  globalStorage.remove(NATIVE_ATTEMPTS_KEY);
  globalStorage.remove(LAST_GATE_AT_KEY);
});

describe("canPromptForStoreReview", () => {
  it("allows a prompt when nothing is stored", () => {
    expect(canPromptForStoreReview()).toBe(true);
  });

  it("blocks after three native attempts in the window", () => {
    globalStorage.set(NATIVE_ATTEMPTS_KEY, JSON.stringify([now, now - 1, now - 2]));

    expect(canPromptForStoreReview(now)).toBe(false);
  });

  it("blocks a prompt while the gate cooldown is active", () => {
    globalStorage.set(LAST_GATE_AT_KEY, JSON.stringify(now - GATE_COOLDOWN_MS + 1));
    expect(canPromptForStoreReview(now)).toBe(false);
  });

  it("allows a prompt when fewer than three native attempts are in the window", () => {
    globalStorage.set(NATIVE_ATTEMPTS_KEY, JSON.stringify([now, now - 1]));
    expect(canPromptForStoreReview(now)).toBe(true);
  });

  it("allows a prompt once the gate cooldown has elapsed", () => {
    globalStorage.set(LAST_GATE_AT_KEY, JSON.stringify(now - GATE_COOLDOWN_MS));
    expect(canPromptForStoreReview(now)).toBe(true);
  });

  it("allows a prompt when a native attempt has left the yearly window", () => {
    globalStorage.set(NATIVE_ATTEMPTS_KEY, JSON.stringify([now, now - 1, now - NATIVE_WINDOW_MS]));
    expect(canPromptForStoreReview(now)).toBe(true);
  });

  it("blocks a prompt after three native attempts even when the cooldown has elapsed", () => {
    globalStorage.set(NATIVE_ATTEMPTS_KEY, JSON.stringify([now, now - 1, now - 2]));
    globalStorage.set(LAST_GATE_AT_KEY, JSON.stringify(now - GATE_COOLDOWN_MS));
    expect(canPromptForStoreReview(now)).toBe(false);
  });
});

describe("nativeAttemptsInWindow", () => {
  it("writes back only the attempts that are still in the yearly window", () => {
    const attempts = [now, now - NATIVE_WINDOW_MS];
    globalStorage.set(NATIVE_ATTEMPTS_KEY, JSON.stringify(attempts));

    expect(nativeAttemptsInWindow(now)).toEqual([now]);
    expect(JSON.parse(globalStorage.getString(NATIVE_ATTEMPTS_KEY)!)).toEqual([now]);
  });

  it("does not rewrite storage when every attempt is still in the window", () => {
    const attempts = [now, now - 1];
    globalStorage.set(NATIVE_ATTEMPTS_KEY, JSON.stringify(attempts));

    expect(nativeAttemptsInWindow(now)).toEqual(attempts);
    expect(JSON.parse(globalStorage.getString(NATIVE_ATTEMPTS_KEY)!)).toEqual(attempts);
  });
});
