import type { Landmarks } from "react-native-vision-camera-face-detector";

export interface FacePoint {
  x: number;
  y: number;
}

export interface FaceLandmarks {
  LEFT_CHEEK: FacePoint;
  LEFT_EYE: FacePoint;
  MOUTH_BOTTOM: FacePoint;
  RIGHT_CHEEK: FacePoint;
  RIGHT_EYE: FacePoint;
}

export interface FaceMeasurements {
  /** Vertical span of the FACE contour (top of oval to chin). */
  contourFaceLength: number;
  /**
   * min(forehead, brow line) — upper-face width for classification
   * (avoids hairline inflation).
   */
  upperFaceWidth: number;
  /** Width of the oval at cheekbone (bizygomatic) level. */
  cheekboneWidth: number;
  /** Width of the oval at jaw (gonial) level. */
  jawWidth: number;
  /**
   * Width near the chin relative to the jaw width (0..1).
   * Low = pointed chin, high = flat/square chin.
   */
  chinTaper: number;
}

export interface FaceWidthSample {
  id: "forehead" | "brow" | "cheekbone" | "jaw" | "chin";
  y: number;
  leftX: number;
  rightX: number;
}

export interface FaceShapeOverlayData {
  faceOval: FacePoint[];
  bounds: { x: number; y: number; width: number; height: number };
  widthSamples: FaceWidthSample[];
}

export interface FaceContourAnalysis {
  measurements: FaceMeasurements;
  overlay: FaceShapeOverlayData;
}

interface MeasurementLevel {
  id: FaceWidthSample["id"];
  y: number;
}

const MIN_OVAL_POINTS = 8;

const REQUIRED_LANDMARK_KEYS = [
  "LEFT_CHEEK",
  "LEFT_EYE",
  "MOUTH_BOTTOM",
  "RIGHT_CHEEK",
  "RIGHT_EYE",
] as const satisfies readonly (keyof FaceLandmarks)[];

export function mapPackageLandmarks(landmarks: Landmarks): FaceLandmarks | undefined {
  for (const key of REQUIRED_LANDMARK_KEYS) {
    if (landmarks[key] == null) {
      return undefined;
    }
  }

  return {
    LEFT_CHEEK: landmarks.LEFT_CHEEK!,
    LEFT_EYE: landmarks.LEFT_EYE!,
    MOUTH_BOTTOM: landmarks.MOUTH_BOTTOM!,
    RIGHT_CHEEK: landmarks.RIGHT_CHEEK!,
    RIGHT_EYE: landmarks.RIGHT_EYE!,
  };
}

/** Positions horizontal width samples using ML Kit landmark anatomy. */
function buildMeasurementLevels(
  faceOval: FacePoint[],
  landmarks: FaceLandmarks,
): MeasurementLevel[] | undefined {
  const ys = faceOval.map((point) => point.y);
  const topY = Math.min(...ys);
  const bottomY = Math.max(...ys);
  const faceSpan = bottomY - topY;

  if (faceSpan <= 0) return undefined;

  const eyeY = midpointY(landmarks.LEFT_EYE, landmarks.RIGHT_EYE);
  const cheekY = midpointY(landmarks.LEFT_CHEEK, landmarks.RIGHT_CHEEK);
  const mouthY = landmarks.MOUTH_BOTTOM.y;

  // Brow band — hairline contour width overstates temples vs cheek width.
  const foreheadY = lerp(topY, eyeY, 0.62);
  const jawY = lerp(cheekY, mouthY, 0.55);
  const chinY = lerp(mouthY, bottomY, 0.7);

  return [
    { id: "forehead", y: foreheadY },
    { id: "brow", y: eyeY },
    { id: "cheekbone", y: cheekY },
    { id: "jaw", y: jawY },
    { id: "chin", y: chinY },
  ];
}

/** Single pass over contour + landmarks for classification and overlay. */
export function analyzeFaceContour(
  faceOval: FacePoint[],
  bounds: { x: number; y: number; width: number; height: number },
  landmarks: FaceLandmarks,
): FaceContourAnalysis | undefined {
  if (faceOval.length < MIN_OVAL_POINTS) return undefined;

  const levels = buildMeasurementLevels(faceOval, landmarks);
  if (!levels) return undefined;

  const ys = faceOval.map((point) => point.y);
  const contourFaceLength = Math.max(...ys) - Math.min(...ys);
  if (contourFaceLength <= 0) return undefined;

  const widthSamples: FaceWidthSample[] = [];
  const widths: Partial<Record<FaceWidthSample["id"], number>> = {};

  for (const level of levels) {
    const span = getWidthSpanAtLevel(faceOval, level.y);
    if (!span) return undefined;

    widths[level.id] = span.rightX - span.leftX;
    widthSamples.push({
      id: level.id,
      y: level.y,
      leftX: span.leftX,
      rightX: span.rightX,
    });
  }

  const foreheadWidth = widths.forehead ?? 0;
  const browLineWidth = widths.brow ?? 0;
  const cheekboneWidth = widths.cheekbone ?? 0;
  const jawWidth = widths.jaw ?? 0;
  const chinWidth = widths.chin ?? 0;

  if (foreheadWidth <= 0 || browLineWidth <= 0 || cheekboneWidth <= 0 || jawWidth <= 0) {
    return undefined;
  }

  return {
    measurements: {
      contourFaceLength,
      upperFaceWidth: Math.min(foreheadWidth, browLineWidth),
      cheekboneWidth,
      jawWidth,
      chinTaper: chinWidth / jawWidth,
    },
    overlay: {
      faceOval,
      bounds,
      widthSamples,
    },
  };
}

function getWidthSpanAtLevel(
  points: FacePoint[],
  level: number,
): { leftX: number; rightX: number } | undefined {
  const intersections: number[] = [];

  for (let i = 0; i < points.length; i++) {
    const start = points[i];
    const end = points[(i + 1) % points.length];

    const crossesLevel = (start.y - level) * (end.y - level) <= 0 && start.y !== end.y;
    if (!crossesLevel) continue;

    const t = (level - start.y) / (end.y - start.y);
    intersections.push(start.x + t * (end.x - start.x));
  }

  if (intersections.length < 2) return undefined;

  return {
    leftX: Math.min(...intersections),
    rightX: Math.max(...intersections),
  };
}

function midpointY(a: FacePoint, b: FacePoint): number {
  return (a.y + b.y) / 2;
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}
