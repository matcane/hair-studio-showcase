import { Image, type ImageProps, type ImageSource } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, type StyleProp } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { GenerationProgressOverlay } from "./GenerationProgressOverlay";
import { useGenerationProgress } from "../hooks/useGenerationProgress";

const PENDING_BLUR_RADIUS = 40;
const PULSE_MIN_OPACITY = 0.65;
const PULSE_DURATION_MS = 900;
const FADE_IN_MS = 240;
const FADE_OUT_MS = 280;
const PROGRESS_RING_SIZE = 72;

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface PendingLookImageProps {
  pending: boolean;
  startedAt?: number;
  source: ImageSource;
  style?: StyleProp<ImageProps["style"]>;
}

export function PendingLookImage({ pending, startedAt, source, style }: PendingLookImageProps) {
  const [showOverlay, setShowOverlay] = useState(pending);
  const pendingRef = useRef(pending);
  const hidingRef = useRef(false);
  const pulse = useSharedValue(1);
  const blurRadius = useSharedValue(pending ? PENDING_BLUR_RADIUS : 0);
  const overlayOpacity = useSharedValue(pending ? 1 : 0);
  const progress = useGenerationProgress(pending, startedAt);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  const hideOverlay = useCallback(() => {
    setShowOverlay(false);
  }, []);

  const fadeOutOverlay = useCallback(() => {
    if (pendingRef.current || hidingRef.current) {
      return;
    }
    hidingRef.current = true;
    cancelAnimation(pulse);
    pulse.set(withTiming(1, { duration: FADE_OUT_MS }));
    blurRadius.set(withTiming(0, { duration: FADE_OUT_MS }));
    overlayOpacity.set(
      withTiming(0, { duration: FADE_OUT_MS }, (finished) => {
        if (finished) {
          scheduleOnRN(hideOverlay);
        }
      }),
    );
  }, [blurRadius, hideOverlay, overlayOpacity, pulse]);

  useEffect(() => {
    if (pending) {
      hidingRef.current = false;
      setShowOverlay(true);
      cancelAnimation(blurRadius);
      cancelAnimation(overlayOpacity);
      blurRadius.set(withTiming(PENDING_BLUR_RADIUS, { duration: FADE_IN_MS }));
      overlayOpacity.set(withTiming(1, { duration: FADE_IN_MS }));
      pulse.set(
        withRepeat(
          withTiming(PULSE_MIN_OPACITY, {
            duration: PULSE_DURATION_MS,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true,
        ),
      );

      return () => {
        cancelAnimation(pulse);
      };
    }

    cancelAnimation(pulse);
    pulse.set(withTiming(1, { duration: FADE_OUT_MS }));
  }, [blurRadius, overlayOpacity, pending, pulse]);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (value) => {
      if (value >= 100) {
        scheduleOnRN(fadeOutOverlay);
      }
    },
  );

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.get(),
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.get(),
  }));

  const imageAnimatedProps = useAnimatedProps(() => ({
    blurRadius: Math.round(blurRadius.get()),
  }));

  return (
    <Animated.View style={[styles.root, pulseStyle]}>
      <AnimatedImage
        source={source}
        style={[styles.fill, style]}
        animatedProps={imageAnimatedProps}
      />
      {showOverlay && (
        <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
          <GenerationProgressOverlay progress={progress} size={PROGRESS_RING_SIZE} />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
