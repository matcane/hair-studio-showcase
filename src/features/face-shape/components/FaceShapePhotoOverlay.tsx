import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, G, Line, Path, Polygon } from "react-native-svg";

import { useTheme } from "@/integrations/theme";

import type { FaceShapeOverlayData, FaceWidthSample } from "../measure";

const DEFAULT_ASPECT_RATIO = 2 / 3;
const VISIBLE_GUIDE_IDS = new Set(["forehead", "cheekbone", "jaw"]);

interface FaceShapePhotoOverlayProps {
  photoUri: string;
  overlay: FaceShapeOverlayData;
  imageSize: { width: number; height: number };
}

interface DisplayMapping {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface MappedBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function FaceShapePhotoOverlay({
  photoUri,
  overlay,
  imageSize,
}: FaceShapePhotoOverlayProps) {
  const theme = useTheme();
  const { t } = useTranslation("main");
  const styles = stylesSheet;
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const frameAspectRatio =
    imageSize.width > 0 && imageSize.height > 0
      ? imageSize.width / imageSize.height
      : DEFAULT_ASPECT_RATIO;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== layout.width || height !== layout.height) {
      setLayout({ width, height });
    }
  };

  const mapping = getContainMapping(layout.width, layout.height, imageSize.width, imageSize.height);
  const mapPoint = (x: number, y: number) => ({
    x: x * mapping.scale + mapping.offsetX,
    y: y * mapping.scale + mapping.offsetY,
  });

  const mappedBounds = mapBounds(overlay.bounds, mapping);

  const ovalPoints = overlay.faceOval
    .map((point) => {
      const mapped = mapPoint(point.x, point.y);
      return `${mapped.x},${mapped.y}`;
    })
    .join(" ");

  const visibleSamples = overlay.widthSamples.filter((sample) => VISIBLE_GUIDE_IDS.has(sample.id));
  const primary = theme.colors.primary;
  const bracketInset = Math.max(12, mappedBounds.width * 0.06);
  const bracketLength = Math.max(18, mappedBounds.width * 0.1);
  const dashLength = Math.min(26, mappedBounds.width * 0.09);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.photoFrame, { aspectRatio: frameAspectRatio }]} onLayout={handleLayout}>
        <Image source={{ uri: photoUri }} contentFit="contain" style={styles.photo} />

        {layout.width > 0 && layout.height > 0 ? (
          <Svg width={layout.width} height={layout.height} style={styles.svg}>
            <Polygon
              points={ovalPoints}
              stroke={`${primary}88`}
              strokeWidth={6}
              fill="transparent"
              strokeLinejoin="round"
            />
            <Polygon
              points={ovalPoints}
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth={1.5}
              fill={`${primary}14`}
              strokeLinejoin="round"
            />

            <CornerBrackets
              bounds={mappedBounds}
              inset={bracketInset}
              length={bracketLength}
              accent={primary}
            />

            {visibleSamples.map((sample) => (
              <GuideMarks
                key={sample.id}
                sample={sample}
                mapPoint={mapPoint}
                dashLength={dashLength}
                accent={primary}
              />
            ))}
          </Svg>
        ) : null}

        <View pointerEvents="none" style={styles.badgeWrap}>
          <BlurView tint="systemUltraThinMaterialDark" intensity={55} style={styles.badge}>
            <MaterialCommunityIcons name="auto-fix" size={15} color={primary} />
            <Text style={styles.badgeText}>{t("face-shape.mappedBadge")}</Text>
          </BlurView>
        </View>
      </View>
    </View>
  );
}

interface CornerBracketsProps {
  bounds: MappedBounds;
  inset: number;
  length: number;
  accent: string;
}

function CornerBrackets({ bounds, inset, length, accent }: CornerBracketsProps) {
  const { x, y, width, height } = bounds;
  const outerX = x - inset;
  const outerY = y - inset;
  const outerRight = x + width + inset;
  const outerBottom = y + height + inset;

  const corners = [
    `M ${outerX} ${outerY + length} L ${outerX} ${outerY} L ${outerX + length} ${outerY}`,
    `M ${outerRight - length} ${outerY} L ${outerRight} ${outerY} L ${outerRight} ${outerY + length}`,
    `M ${outerX} ${outerBottom - length} L ${outerX} ${outerBottom} L ${outerX + length} ${outerBottom}`,
    `M ${outerRight - length} ${outerBottom} L ${outerRight} ${outerBottom} L ${outerRight} ${outerBottom - length}`,
  ];

  return (
    <G>
      {corners.map((path, index) => (
        <Path
          key={`bracket-${index}`}
          d={path}
          stroke="rgba(255, 255, 255, 0.92)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="transparent"
        />
      ))}
      {[
        { cx: outerX, cy: outerY },
        { cx: outerRight, cy: outerY },
        { cx: outerX, cy: outerBottom },
        { cx: outerRight, cy: outerBottom },
      ].map((dot, index) => (
        <Circle key={`bracket-dot-${index}`} cx={dot.cx} cy={dot.cy} r={2.5} fill={accent} />
      ))}
    </G>
  );
}

interface GuideMarksProps {
  sample: FaceWidthSample;
  mapPoint: (x: number, y: number) => { x: number; y: number };
  dashLength: number;
  accent: string;
}

function GuideMarks({ sample, mapPoint, dashLength, accent }: GuideMarksProps) {
  const left = mapPoint(sample.leftX, sample.y);
  const right = mapPoint(sample.rightX, sample.y);

  return (
    <G opacity={0.8}>
      <Line
        x1={left.x}
        y1={left.y}
        x2={left.x + dashLength}
        y2={left.y}
        stroke="rgba(255, 255, 255, 0.75)"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Line
        x1={right.x - dashLength}
        y1={right.y}
        x2={right.x}
        y2={right.y}
        stroke="rgba(255, 255, 255, 0.75)"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Circle cx={left.x} cy={left.y} r={3.5} fill="#FFF8F6" stroke={accent} strokeWidth={1} />
      <Circle cx={right.x} cy={right.y} r={3.5} fill="#FFF8F6" stroke={accent} strokeWidth={1} />
    </G>
  );
}

function mapBounds(bounds: FaceShapeOverlayData["bounds"], mapping: DisplayMapping): MappedBounds {
  return {
    x: bounds.x * mapping.scale + mapping.offsetX,
    y: bounds.y * mapping.scale + mapping.offsetY,
    width: bounds.width * mapping.scale,
    height: bounds.height * mapping.scale,
  };
}

function getContainMapping(
  boxWidth: number,
  boxHeight: number,
  imageWidth: number,
  imageHeight: number,
): DisplayMapping {
  if (boxWidth <= 0 || boxHeight <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }

  const scale = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  const drawnWidth = imageWidth * scale;
  const drawnHeight = imageHeight * scale;

  return {
    scale,
    offsetX: (boxWidth - drawnWidth) / 2,
    offsetY: (boxHeight - drawnHeight) / 2,
  };
}

const stylesSheet = StyleSheet.create({
  wrapper: {
    alignSelf: "stretch",
  },
  photoFrame: {
    width: "100%",
    borderRadius: 24,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: "#000",
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
  },
  svg: {
    ...StyleSheet.absoluteFillObject,
  },
  badgeWrap: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  badgeText: {
    fontSize: 13,
    lineHeight: 13 * 1.25,
    fontWeight: "600",
    letterSpacing: 0.4,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
});
