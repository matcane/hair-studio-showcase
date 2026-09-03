import { z } from "zod";

import { globalStorage } from "@/services/storage";

export const NATIVE_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;
export const GATE_COOLDOWN_MS = 1 * 24 * 60 * 60 * 1000;
export const MAX_NATIVE_ATTEMPTS = 3;

export const NATIVE_ATTEMPTS_KEY = "storeReviewNativeAttempts";
export const LAST_GATE_AT_KEY = "storeReviewLastGateAt";
export const LEGACY_FLAG_KEY = "isStoreReviewed";

const jsonValue = z.string().transform((raw, ctx) => {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    ctx.addIssue({ code: "custom", message: "Invalid JSON" });
    return z.NEVER;
  }
});

const nativeAttemptsSchema = jsonValue.pipe(z.array(z.number())).catch([]);
const lastGateAtSchema = jsonValue.pipe(z.number()).optional().catch(undefined);

function read<T>(key: string, schema: z.ZodType<T>) {
  return schema.parse(globalStorage.getString(key));
}

function write(key: string, value: unknown) {
  globalStorage.set(key, JSON.stringify(value));
}

export function nativeAttemptsInWindow(now: number) {
  const attempts = read(NATIVE_ATTEMPTS_KEY, nativeAttemptsSchema);
  const inWindow = attempts.filter((timestamp) => timestamp > now - NATIVE_WINDOW_MS);

  if (inWindow.length !== attempts.length) {
    write(NATIVE_ATTEMPTS_KEY, inWindow);
  }

  return inWindow;
}

export function canPromptForStoreReview(now = Date.now()) {
  if (nativeAttemptsInWindow(now).length >= MAX_NATIVE_ATTEMPTS) return false;

  const lastGateAt = read(LAST_GATE_AT_KEY, lastGateAtSchema);
  return lastGateAt == null || now - lastGateAt >= GATE_COOLDOWN_MS;
}

export function recordNativeStoreReviewAttempt(now = Date.now()) {
  write(NATIVE_ATTEMPTS_KEY, [...nativeAttemptsInWindow(now), now]);
  write(LAST_GATE_AT_KEY, now);
}

export function markStoreReviewGateClosed(now = Date.now()) {
  write(LAST_GATE_AT_KEY, now);
}

export function clearStoreReviewState() {
  globalStorage.remove(NATIVE_ATTEMPTS_KEY);
  globalStorage.remove(LAST_GATE_AT_KEY);
  globalStorage.remove(LEGACY_FLAG_KEY);
}
