import { useSegments } from "expo-router";
import { useEffect } from "react";

import { posthog } from "./providers";
import type { AnalyticsEvents } from "./types";
import { getAnalyticsPath } from "./utils";

export function useScreenTracking() {
  const segments = useSegments();

  useEffect(() => {
    const isRouterReady = segments.length > 0;
    if (!isRouterReady) return;

    const analyticsPath = getAnalyticsPath(segments);

    if (posthog) {
      posthog.screen(analyticsPath);
    }

    if (__DEV__) {
      console.info("[ANALYTICS][PostHog] screen view", {
        analyticsPath,
        isRouterReady,
        segments,
      });
    }
  }, [segments]);
}

export const Analytics = {
  track: <K extends keyof AnalyticsEvents>(event: K, properties: AnalyticsEvents[K]) => {
    if (posthog) {
      posthog.capture(event, properties);
    }

    if (__DEV__) {
      console.info(`[ANALYTICS][PostHog] event: ${event}`, properties);
    }
  },
};
