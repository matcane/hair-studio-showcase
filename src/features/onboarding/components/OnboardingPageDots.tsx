import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { useTheme } from "@/integrations/theme";

import { useOnboardingStore, type ProgressKey } from "../store";

const DOT_HEIGHT = 8;
const DOT_WIDTH_INACTIVE = 8;
const DOT_WIDTH_ACTIVE = 24;
const DOT_GAP = 6;

const ANIMATION_DURATION_MS = 800;

interface OnboardingPageDotsProps {
  progressKey: ProgressKey;
  colors?: { background?: string; progress?: string };
}

interface PageDotProps {
  index: number;
  activeProgress: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
}

const PageDot = memo(function PageDot({
  index,
  activeProgress,
  activeColor,
  inactiveColor,
}: PageDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const v = activeProgress.value;
    const d = Math.min(Math.abs(v - index), 1);
    const w = interpolate(d, [0, 1], [DOT_WIDTH_ACTIVE, DOT_WIDTH_INACTIVE], Extrapolation.CLAMP);
    const bg = interpolateColor(d, [0, 1], [activeColor, inactiveColor]);
    return {
      width: w,
      backgroundColor: bg,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
});

export function OnboardingPageDots({ progressKey, colors }: OnboardingPageDotsProps) {
  const theme = useTheme();

  const currentStep = useOnboardingStore((state) => state.progress[progressKey].currentStep);
  const maxSteps = useOnboardingStore((state) => state.progress[progressKey].maxSteps);

  const activeColor = colors?.progress ?? theme.colors.primary;
  const inactiveColor = colors?.background ?? theme.colors.secondary;

  const activeIndex = Math.min(Math.max(0, Math.round(currentStep)), Math.max(0, maxSteps - 1));

  const activeProgress = useSharedValue(activeIndex);

  useEffect(() => {
    activeProgress.value = withTiming(activeIndex, {
      duration: ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.exp),
    });
  }, [activeIndex, activeProgress]);

  if (maxSteps <= 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {Array.from({ length: maxSteps }, (_, index) => (
          <PageDot
            key={index}
            index={index}
            activeProgress={activeProgress}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
    position: "relative",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: DOT_GAP,
  },
  dot: {
    height: DOT_HEIGHT,
    borderRadius: DOT_HEIGHT / 2,
  },
});
