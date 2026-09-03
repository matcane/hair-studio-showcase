import { useCallback, useEffect, useRef, useState } from "react";
import type { ViewStyle } from "react-native";
import {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { useGenerationProgress } from "./useGenerationProgress";

const PANEL_RESIZE_DURATION_MS = 320;
const PANEL_COLLAPSE_DURATION_MS = 420;
const RESULT_UNBLUR_DURATION_MS = 520;
const GENERATION_BLUR_RADIUS = 10;

const revealEasing = Easing.out(Easing.cubic);

export interface UseGalleryRevealAnimationResult {
  blurRadius: SharedValue<number>;
  generationProgress: SharedValue<number>;
  showDraftPanel: boolean;
  showResultChrome: boolean;
  isPanelCollapsing: boolean;
  showPendingPanel: boolean;
  panelShellStyle: AnimatedStyle<ViewStyle>;
  panelResizeDurationMs: number;
  onPanelContentLayout: (height: number) => void;
  /** Call synchronously at the start of generation success (before any await) to avoid blur/panel flicker. */
  prepareRevealFromGenerationSuccess: () => void;
  startRevealAnimation: () => void;
}

export function useGalleryRevealAnimation(
  isGenerationPending: boolean,
): UseGalleryRevealAnimationResult {
  const [showDraftPanel, setShowDraftPanel] = useState(true);
  const [showResultChrome, setShowResultChrome] = useState(false);
  const [isRevealAnimating, setIsRevealAnimating] = useState(false);
  const [isPanelCollapsing, setIsPanelCollapsing] = useState(false);

  const hasCapturedInitialPanelHeight = useRef(false);
  const isHoldingGenerationBlurRef = useRef(false);
  const collapseAfterProgressRef = useRef(false);

  const isPanelCollapsingRef = useRef(false);

  const blurRadius = useSharedValue(0);
  const generationProgress = useGenerationProgress(isGenerationPending);
  const panelHeight = useSharedValue(0);
  const isPanelHeightMeasured = useSharedValue(0);
  const isPanelCollapseAnimating = useSharedValue(false);

  const finishRevealAnimation = useCallback(() => {
    isHoldingGenerationBlurRef.current = false;
    isPanelCollapsingRef.current = false;
    setShowResultChrome(true);
    setIsRevealAnimating(false);
    setIsPanelCollapsing(false);
    isPanelCollapseAnimating.set(false);
  }, [isPanelCollapseAnimating]);

  const snapToGenerationBlur = useCallback(() => {
    cancelAnimation(blurRadius);
    blurRadius.set(GENERATION_BLUR_RADIUS);
  }, [blurRadius]);

  const onPanelCollapsed = useCallback(() => {
    setShowDraftPanel(false);
    cancelAnimation(blurRadius);
    blurRadius.set(
      withTiming(0, { duration: RESULT_UNBLUR_DURATION_MS, easing: revealEasing }, (done) => {
        if (!done) {
          blurRadius.set(0);
        }
        scheduleOnRN(finishRevealAnimation);
      }),
    );
  }, [blurRadius, finishRevealAnimation]);

  const runPanelCollapseAnimation = useCallback(() => {
    isPanelCollapseAnimating.set(true);
    panelHeight.set(
      withTiming(0, { duration: PANEL_COLLAPSE_DURATION_MS, easing: revealEasing }, (finished) => {
        if (!finished) {
          panelHeight.set(0);
        }
        scheduleOnRN(onPanelCollapsed);
      }),
    );
  }, [isPanelCollapseAnimating, onPanelCollapsed, panelHeight]);

  const collapsePanelAfterProgress = useCallback(() => {
    if (!collapseAfterProgressRef.current || isPanelCollapsingRef.current) {
      return;
    }
    collapseAfterProgressRef.current = false;
    isPanelCollapsingRef.current = true;
    setTimeout(() => {
      setIsPanelCollapsing(true);
      runPanelCollapseAnimation();
    }, 220);
  }, [runPanelCollapseAnimation]);

  useAnimatedReaction(
    () => Math.round(generationProgress.value),
    (value) => {
      if (value >= 100) {
        scheduleOnRN(collapsePanelAfterProgress);
      }
    },
  );

  const prepareRevealFromGenerationSuccess = useCallback(() => {
    isHoldingGenerationBlurRef.current = true;
    snapToGenerationBlur();
    setIsRevealAnimating(true);
  }, [snapToGenerationBlur]);

  const showPendingPanel = isGenerationPending || isRevealAnimating || isPanelCollapsing;

  useEffect(() => {
    if (isGenerationPending) {
      isHoldingGenerationBlurRef.current = false;
      collapseAfterProgressRef.current = false;
      cancelAnimation(blurRadius);
      blurRadius.set(withTiming(GENERATION_BLUR_RADIUS, { duration: 280, easing: revealEasing }));
      return;
    }

    if (
      isHoldingGenerationBlurRef.current ||
      isRevealAnimating ||
      isPanelCollapsing ||
      showResultChrome
    ) {
      return;
    }

    collapseAfterProgressRef.current = false;
    cancelAnimation(blurRadius);
    blurRadius.set(withTiming(0, { duration: 200, easing: revealEasing }));
  }, [blurRadius, isGenerationPending, isRevealAnimating, isPanelCollapsing, showResultChrome]);

  const onPanelContentLayout = useCallback(
    (height: number) => {
      if (height <= 0 || isPanelCollapsingRef.current) {
        return;
      }

      if (!hasCapturedInitialPanelHeight.current) {
        panelHeight.set(height);
        isPanelHeightMeasured.set(1);
        hasCapturedInitialPanelHeight.current = true;
        return;
      }

      panelHeight.set(
        withTiming(height, {
          duration: PANEL_RESIZE_DURATION_MS,
          easing: revealEasing,
        }),
      );
    },
    [isPanelHeightMeasured, panelHeight],
  );

  const panelShellStyle = useAnimatedStyle(() => {
    if (!isPanelHeightMeasured.value && !isPanelCollapseAnimating.value) {
      return {};
    }

    return {
      height: panelHeight.value,
      overflow: "hidden",
    };
  });

  const startRevealAnimation = useCallback(() => {
    isHoldingGenerationBlurRef.current = true;
    snapToGenerationBlur();
    setIsRevealAnimating(true);
    collapseAfterProgressRef.current = true;

    if (generationProgress.get() >= 100) {
      collapsePanelAfterProgress();
    }
  }, [collapsePanelAfterProgress, generationProgress, snapToGenerationBlur]);

  return {
    blurRadius,
    generationProgress,
    showDraftPanel,
    showResultChrome,
    isPanelCollapsing,
    showPendingPanel,
    panelShellStyle,
    panelResizeDurationMs: PANEL_RESIZE_DURATION_MS,
    onPanelContentLayout,
    prepareRevealFromGenerationSuccess,
    startRevealAnimation,
  };
}
