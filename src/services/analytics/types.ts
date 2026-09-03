import type { Href, Route, RouteSegments } from "expo-router";

export type Segments = RouteSegments<Route>;
export type AnalyticsPath = Extract<Href, string>;

export type HairPreviewType =
  "hair_change" | "color_change" | "celebrity_hair_change" | "makeup_change" | "fun_change";

export type PaywallSource = "generate" | "onboarding" | "settings" | "gallery";

export type DraftOpenedSource = "catalog" | "create" | "face_shape" | "reuse";

export type GenerateBlockedReason =
  "free_preview_limit" | "free_preview_used" | "usage_not_allowed";

type EmptyProperties = Record<string, never>;

export interface AnalyticsEvents {
  hair_option_opened: {
    id: string;
    type: HairPreviewType;
    title?: string;
  };
  review_gate_shown: EmptyProperties;
  review_gate_answered: {
    answer: "yes" | "no" | "dismissed";
  };
  review_prompt_requested: {
    source: "gate" | "settings";
  };
  review_gate_negative: EmptyProperties;
  generate_started: {
    is_free_generation: boolean;
  };
  generate_completed: {
    is_free_generation: boolean;
  };
  generate_tapped: {
    is_free_generation: boolean;
  };
  generate_blocked_paywall: {
    reason: GenerateBlockedReason;
  };
  paywall_viewed: {
    source?: PaywallSource;
  };
  purchase_completed: {
    source?: PaywallSource;
  };
  look_shared: EmptyProperties;
  look_saved: EmptyProperties;
  onboarding_completed: EmptyProperties;
  camera_opened: EmptyProperties;
  camera_photo_captured: EmptyProperties;
  draft_opened: {
    source?: DraftOpenedSource;
  };
}
