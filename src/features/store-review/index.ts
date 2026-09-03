import { openURL } from "expo-linking";
import * as StoreReview from "expo-store-review";
import { Alert, Platform } from "react-native";

import i18n from "@/integrations/i18n";
import { Analytics } from "@/services/analytics";
import type { AnalyticsEvents } from "@/services/analytics/types";

import {
  canPromptForStoreReview,
  clearStoreReviewState,
  markStoreReviewGateClosed,
  recordNativeStoreReviewAttempt,
} from "./eligibility";

const PROMPT_DELAY_MS = 4000;
const SURVEY_AFTER_ALERT_MS = 300;

type ReviewPromptSource = AnalyticsEvents["review_prompt_requested"]["source"];

let pendingStoreReviewTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingSurveyTimeout: ReturnType<typeof setTimeout> | null = null;

function skipNativeStoreReview() {
  clearPendingStoreReviewTimeout();
  markStoreReviewGateClosed();
}

function clearPendingSurveyTimeout() {
  if (pendingSurveyTimeout == null) return;
  clearTimeout(pendingSurveyTimeout);
  pendingSurveyTimeout = null;
}

function onStoreReviewYes() {
  Analytics.track("review_gate_answered", { answer: "yes" });
  requestNativeStoreReview("gate");
}

function onStoreReviewNo() {
  Analytics.track("review_gate_answered", { answer: "no" });
  skipNativeStoreReview();

  clearPendingSurveyTimeout();
  pendingSurveyTimeout = setTimeout(() => {
    pendingSurveyTimeout = null;
    Analytics.track("review_gate_negative", {});
  }, SURVEY_AFTER_ALERT_MS);
}

function onStoreReviewDismiss() {
  Analytics.track("review_gate_answered", { answer: "dismissed" });
  skipNativeStoreReview();
}

function showStoreReviewGate() {
  Analytics.track("review_gate_shown", {});

  const yesButton = {
    text: i18n.t("main:storeReview.gate.yes"),
    isPreferred: true,
    onPress: onStoreReviewYes,
  };
  const noButton = {
    text: i18n.t("main:storeReview.gate.no"),
    onPress: onStoreReviewNo,
  };
  const cancelButton = {
    text: i18n.t("main:gallery.cancel"),
    style: "cancel" as const,
    onPress: onStoreReviewDismiss,
  };

  Alert.alert(
    i18n.t("main:storeReview.gate.title"),
    undefined,
    Platform.OS === "android"
      ? [cancelButton, noButton, yesButton]
      : [yesButton, noButton, cancelButton],
    { cancelable: true, onDismiss: onStoreReviewDismiss },
  );
}

export function clearPendingStoreReviewTimeout() {
  if (pendingStoreReviewTimeout == null) return;
  clearTimeout(pendingStoreReviewTimeout);
  pendingStoreReviewTimeout = null;
}

export function resetStoreReview() {
  clearPendingStoreReviewTimeout();
  clearPendingSurveyTimeout();
  clearStoreReviewState();
}

export function requestNativeStoreReview(source: ReviewPromptSource) {
  clearPendingStoreReviewTimeout();
  recordNativeStoreReviewAttempt();
  Analytics.track("review_prompt_requested", { source });
  promptForStoreReview();
}

export function maybePromptForStoreReview() {
  if (!canPromptForStoreReview()) return;
  if (pendingStoreReviewTimeout != null) return;

  pendingStoreReviewTimeout = setTimeout(() => {
    pendingStoreReviewTimeout = null;
    if (!canPromptForStoreReview()) return;

    showStoreReviewGate();
  }, PROMPT_DELAY_MS);
}

async function promptForStoreReview() {
  if (await StoreReview.hasAction()) {
    await StoreReview.requestReview();
  } else {
    const url = StoreReview.storeUrl();
    if (url) openURL(`${url}?action=write-review`);
  }
}
