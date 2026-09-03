import { useEffect, useRef } from "react";
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

export const GENERATION_PROGRESS_DURATION_MS = 12_000;

const catchUpEasing = Easing.out(Easing.cubic);

export function useGenerationProgress(pending: boolean, startedAt?: number): SharedValue<number> {
  const progress = useSharedValue(0);
  const didCatchUpRef = useRef(false);

  useEffect(() => {
    if (pending) {
      didCatchUpRef.current = false;
      const elapsed = startedAt != null ? Math.max(0, Date.now() - startedAt) : 0;
      const current = Math.min(99, (elapsed / GENERATION_PROGRESS_DURATION_MS) * 99);
      const remainingMs = Math.max(0, GENERATION_PROGRESS_DURATION_MS - elapsed);
      cancelAnimation(progress);
      progress.set(current);
      if (remainingMs > 0) {
        progress.set(withTiming(99, { duration: remainingMs, easing: Easing.linear }));
      }
      return;
    }

    if (didCatchUpRef.current || progress.get() <= 0) {
      return;
    }

    didCatchUpRef.current = true;
    cancelAnimation(progress);
    const remaining = Math.max(0, 100 - progress.get());
    progress.set(
      withTiming(100, {
        duration: Math.min(1400, Math.max(280, remaining * 24)),
        easing: catchUpEasing,
      }),
    );
  }, [pending, progress, startedAt]);

  return progress;
}
