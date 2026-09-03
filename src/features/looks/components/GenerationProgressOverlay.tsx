import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedReaction,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { scheduleOnRN } from "react-native-worklets";

const DEFAULT_SIZE = 168;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GenerationProgressOverlayProps {
  progress: SharedValue<number>;
  size?: number;
}

export function GenerationProgressOverlay({
  progress,
  size = DEFAULT_SIZE,
}: GenerationProgressOverlayProps) {
  const [percent, setPercent] = useState(0);
  const strokeWidth = size * (10 / DEFAULT_SIZE);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const styles = createStyles(size);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (value, previous) => {
      if (value !== previous) {
        scheduleOnRN(setPercent, value);
      }
    },
  );

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value / 100),
  }));

  return (
    <View style={styles.root} pointerEvents="none">
      <Svg width={size} height={size} style={styles.ring}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={strokeWidth}
          fill="rgba(0,0,0,0.28)"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animatedProps={ringProps}
        />
      </Svg>
      <Text style={styles.percent}>{`${percent}%`}</Text>
    </View>
  );
}

const createStyles = (size: number) =>
  StyleSheet.create({
    root: {
      ...StyleSheet.absoluteFill,
      alignItems: "center",
      justifyContent: "center",
    },
    ring: {
      transform: [{ rotate: "-90deg" }],
    },
    percent: {
      position: "absolute",
      fontSize: size * (40 / DEFAULT_SIZE),
      fontWeight: "700",
      color: "#FFFFFF",
      fontVariant: ["tabular-nums"],
    },
  });
