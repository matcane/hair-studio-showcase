import { memo } from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

import type { DetectedFace } from "../types";

interface FaceBoundingBoxOverlayProps {
  detectedFace: SharedValue<DetectedFace | null>;
  cameraFacing: "front" | "back";
  color?: string;
  strokeWidth?: number;
  corner?: number;
}

const CORNER_ANCHORS: ViewStyle[] = [
  { top: 0, left: 0 },
  { top: 0, right: 0 },
  { bottom: 0, left: 0 },
  { bottom: 0, right: 0 },
];

function FaceBoundingBoxOverlayComponent({
  detectedFace,
  cameraFacing,
  color = "#4ADE80",
  strokeWidth = 3,
  corner = 16,
}: FaceBoundingBoxOverlayProps) {
  const previewWidth = useSharedValue(0);
  const previewHeight = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const face = detectedFace.get();
    const layoutWidth = previewWidth.get();
    const layoutHeight = previewHeight.get();

    if (face == null || layoutWidth <= 1 || layoutHeight <= 1) {
      return { opacity: 0 };
    }

    const { bounds, frameWidth, frameHeight } = face;
    // iOS front camera is already mirrored in ML Kit; Android is not.
    const boundsOriginX =
      Platform.OS === "android" && cameraFacing === "front"
        ? frameWidth - bounds.x - bounds.width
        : bounds.x;
    const coverScale = Math.max(layoutWidth / frameWidth, layoutHeight / frameHeight);

    const x = boundsOriginX * coverScale - (frameWidth * coverScale - layoutWidth) / 2;
    const y = bounds.y * coverScale - (frameHeight * coverScale - layoutHeight) / 2;

    return {
      opacity: 1,
      width: bounds.width * coverScale,
      height: bounds.height * coverScale,
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  const barStyle = { backgroundColor: color, borderRadius: strokeWidth / 2 };

  return (
    <Animated.View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(event) => {
        previewWidth.set(event.nativeEvent.layout.width);
        previewHeight.set(event.nativeEvent.layout.height);
      }}>
      <Animated.View pointerEvents="none" style={[styles.box, animatedStyle]}>
        {CORNER_ANCHORS.flatMap((anchor, index) => [
          <View
            key={`${index}-h`}
            style={[styles.bar, barStyle, anchor, { width: corner, height: strokeWidth }]}
          />,
          <View
            key={`${index}-v`}
            style={[styles.bar, barStyle, anchor, { width: strokeWidth, height: corner }]}
          />,
        ])}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  bar: {
    position: "absolute",
  },
});

export const FaceBoundingBoxOverlay = memo(FaceBoundingBoxOverlayComponent);
