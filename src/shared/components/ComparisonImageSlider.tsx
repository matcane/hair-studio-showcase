import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image, type ImageProps, type ImageSource } from "expo-image";
import { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, View, type ColorValue } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

const HANDLE_KNOB = 40;
const LINE_WIDTH = 3;
const EDGE_MARGIN = 8;

type LeftImageProps = Omit<ImageProps, "source" | "style" | "contentFit" | "blurRadius">;

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface ComparisonImageSliderProps {
  leftSource: ImageSource;
  rightSource: ImageSource;
  borderRadius?: number;
  handleColor?: ColorValue;
  lineColor?: ColorValue;
  comparisonEnabled?: boolean;
  rightImageProps?: LeftImageProps;
  /** When set, drives `blurRadius` on the right image on the UI thread. */
  rightBlurRadius?: SharedValue<number>;
}

export function ComparisonImageSlider({
  leftSource,
  rightSource,
  borderRadius = 32,
  handleColor = "#FFFFFF",
  lineColor = "#FFFFFF",
  comparisonEnabled = true,
  rightImageProps,
  rightBlurRadius,
}: ComparisonImageSliderProps) {
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const containerWidth = useSharedValue(0);
  const splitX = useSharedValue(0);
  const startSplit = useSharedValue(0);
  const hasInitialSplit = useRef(false);

  const onLayoutWidth = useCallback(
    (w: number) => {
      if (w <= 0) {
        return;
      }
      containerWidth.set(w);
      setMeasuredWidth(w);
      if (!hasInitialSplit.current) {
        splitX.set(w / 2);
        hasInitialSplit.current = true;
      } else {
        splitX.set(Math.min(Math.max(splitX.get(), EDGE_MARGIN), w - EDGE_MARGIN));
      }
    },
    [containerWidth, splitX],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(comparisonEnabled)
        .activeOffsetX([-14, 14])
        .failOffsetY([-18, 18])
        .onBegin(() => {
          startSplit.set(splitX.get());
        })
        .onUpdate((e) => {
          const w = containerWidth.get();
          if (w <= 0) {
            return;
          }
          const next = startSplit.get() + e.translationX;
          splitX.set(Math.min(Math.max(next, EDGE_MARGIN), w - EDGE_MARGIN));
        }),
    [comparisonEnabled, containerWidth, splitX, startSplit],
  );

  const clipStyle = useAnimatedStyle(() => ({
    width: splitX.get(),
  }));

  const handleGroupStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: splitX.get() - HANDLE_KNOB / 2 }],
  }));

  const rightImageStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  const rightImageAnimatedProps = useAnimatedProps(() => ({
    blurRadius: Math.round(rightBlurRadius?.value ?? 0),
  }));

  const clipRadiusStyle = {
    borderTopLeftRadius: borderRadius,
    borderBottomLeftRadius: borderRadius,
  };

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[styles.root, { borderRadius }]}
        onLayout={(e) => {
          onLayoutWidth(e.nativeEvent.layout.width);
        }}>
        <Animated.View style={[styles.fullImage, rightImageStyle]}>
          {rightBlurRadius ? (
            <AnimatedImage
              {...rightImageProps}
              animatedProps={rightImageAnimatedProps}
              source={rightSource}
              contentFit="cover"
              style={styles.fullImage}
            />
          ) : (
            <Image
              {...rightImageProps}
              source={rightSource}
              contentFit="cover"
              style={styles.fullImage}
            />
          )}
        </Animated.View>

        {comparisonEnabled ? (
          <>
            <Animated.View style={[styles.clip, clipStyle, clipRadiusStyle]}>
              {measuredWidth > 0 ? (
                <Image
                  source={leftSource}
                  contentFit="cover"
                  style={[styles.leftImage, { width: measuredWidth }]}
                />
              ) : null}
            </Animated.View>

            <Animated.View style={[styles.handleColumn, handleGroupStyle]} pointerEvents="none">
              <View style={[styles.line, { backgroundColor: lineColor }]} />
              <View style={[styles.knob, { borderColor: lineColor, backgroundColor: lineColor }]}>
                <MaterialCommunityIcons name="swap-horizontal" size={24} color={handleColor} />
              </View>
            </Animated.View>
          </>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  fullImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  clip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden",
  },
  leftImage: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
  },
  handleColumn: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: HANDLE_KNOB,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    position: "absolute",
    left: HANDLE_KNOB / 2 - LINE_WIDTH / 2,
    top: 0,
    bottom: 0,
    width: LINE_WIDTH,
  },
  knob: {
    width: HANDLE_KNOB - 8,
    height: HANDLE_KNOB - 8,
    borderRadius: (HANDLE_KNOB - 8) / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
