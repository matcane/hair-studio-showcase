import type { Segments } from "./types";

const SPECIAL_CASES: Record<string, string> = {
  "(tabs)": "(tabs)/(home)",
} as const;

export function getAnalyticsPath(segments: Segments) {
  const path = segments.join("/");

  return `/${SPECIAL_CASES[path] ?? path}`;
}
