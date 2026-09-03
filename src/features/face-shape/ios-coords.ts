import { Platform } from "react-native";
import type { Landmarks } from "react-native-vision-camera-face-detector";

import { mapPackageLandmarks, type FaceLandmarks, type FacePoint } from "./measure";

interface FaceBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NormalizedStaticFaceDetection {
  faceOval: FacePoint[];
  bounds: FaceBounds;
  landmarks: FaceLandmarks;
}

/**
 * iOS ImageFaceDetector always swaps x/y for bounds origins, landmarks, and
 * contours in native code (HybridFace). Undo like prepareDraftPhoto: swap
 * origins/points, keep bounds width/height.
 */
export function normalizeStaticFaceDetection(
  faceOval: FacePoint[],
  bounds: FaceBounds,
  landmarks: Landmarks,
): NormalizedStaticFaceDetection | undefined {
  const mappedLandmarks = mapPackageLandmarks(landmarks);
  if (!mappedLandmarks) {
    return undefined;
  }

  if (Platform.OS !== "ios") {
    return {
      faceOval,
      bounds,
      landmarks: mappedLandmarks,
    };
  }

  return {
    faceOval: faceOval.map((point) => ({ x: point.y, y: point.x })),
    bounds: {
      x: bounds.y,
      y: bounds.x,
      width: bounds.width,
      height: bounds.height,
    },
    landmarks: {
      LEFT_CHEEK: { x: mappedLandmarks.LEFT_CHEEK.y, y: mappedLandmarks.LEFT_CHEEK.x },
      LEFT_EYE: { x: mappedLandmarks.LEFT_EYE.y, y: mappedLandmarks.LEFT_EYE.x },
      MOUTH_BOTTOM: { x: mappedLandmarks.MOUTH_BOTTOM.y, y: mappedLandmarks.MOUTH_BOTTOM.x },
      RIGHT_CHEEK: { x: mappedLandmarks.RIGHT_CHEEK.y, y: mappedLandmarks.RIGHT_CHEEK.x },
      RIGHT_EYE: { x: mappedLandmarks.RIGHT_EYE.y, y: mappedLandmarks.RIGHT_EYE.x },
    },
  };
}
