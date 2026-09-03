import { File } from "expo-file-system";
import { ImageManipulator } from "expo-image-manipulator";
import { Image } from "react-native";
import { createImageFaceDetector } from "react-native-vision-camera-face-detector";

import { Logger } from "@/services/logger";
import { IS_IOS_SIMULATOR } from "@/shared/constants";

import { classifyFaceShape } from "./classify";
import { normalizeStaticFaceDetection } from "./ios-coords";
import { analyzeFaceContour, type FaceShapeOverlayData } from "./measure";
import type { FaceShape } from "./types";

export type FaceShapeDetectionFailureReason =
  "no_face" | "multiple_faces" | "head_tilted" | "detection_failed" | "detector_unavailable";

export interface FaceShapeDetectionSuccess {
  status: "success";
  shape: FaceShape;
  alternateShape?: FaceShape;
  isBorderline: boolean;
  overlay?: FaceShapeOverlayData;
  imageSize: { width: number; height: number };
}

export interface FaceShapeDetectionFailure {
  status: "failure";
  reason: FaceShapeDetectionFailureReason;
}

export type FaceShapeDetectionResult = FaceShapeDetectionSuccess | FaceShapeDetectionFailure;

// Near-frontal pose limits (degrees). Beyond these the 2D contour widths
// are foreshortened and the classification becomes unreliable.
const MAX_YAW_ANGLE = 18;
const MAX_ROLL_ANGLE = 15;
const MAX_PITCH_ANGLE = 20;
const MIN_FACE_SIZE = 0.1;

function failure(reason: FaceShapeDetectionFailureReason): FaceShapeDetectionFailure {
  return { status: "failure", reason };
}

function ensureFileUri(uri: string): string {
  if (uri.startsWith("file://") || uri.startsWith("content://") || uri.startsWith("ph://")) {
    return uri;
  }
  return `file://${uri}`;
}

async function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  try {
    const image = await ImageManipulator.manipulate(uri).renderAsync();
    return { width: image.width, height: image.height };
  } catch {
    return new Promise((resolve, reject) => {
      Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
    });
  }
}

export async function detectFaceShapeFromImage(
  imageUri: string,
): Promise<FaceShapeDetectionResult> {
  const normalizedUri = ensureFileUri(imageUri);

  try {
    const imageFile = new File(normalizedUri);
    if (!imageFile.exists || imageFile.size === 0) {
      Logger.warn("Face shape detection skipped: image file missing or empty", {
        imageUri: normalizedUri,
      });
      return failure("detection_failed");
    }

    if (IS_IOS_SIMULATOR) {
      const imageSize = await getImageSize(normalizedUri);
      Logger.debug("Face shape detection skipped on iOS Simulator", {
        imageUri: normalizedUri,
      });
      return {
        status: "success",
        shape: "oval",
        isBorderline: false,
        imageSize,
      };
    }

    const faceDetector = createImageFaceDetector({
      performanceMode: "accurate",
      runContours: true,
      runLandmarks: true,
      minFaceSize: MIN_FACE_SIZE,
    });

    const faces = faceDetector.detectFaces(normalizedUri);

    if (!Array.isArray(faces) || faces.length === 0) {
      return failure("no_face");
    }
    if (faces.length > 1) {
      return failure("multiple_faces");
    }

    const face = faces[0];
    const isTilted =
      Math.abs(face.yawAngle) > MAX_YAW_ANGLE ||
      Math.abs(face.rollAngle) > MAX_ROLL_ANGLE ||
      Math.abs(face.pitchAngle) > MAX_PITCH_ANGLE;
    if (isTilted) {
      return failure("head_tilted");
    }

    const faceOval = face.contours?.FACE;
    if (!faceOval?.length || !face.landmarks) {
      Logger.warn("Face shape detection: missing contour or landmarks", {
        imageUri: normalizedUri,
      });
      return failure("detection_failed");
    }

    const imageSize = await getImageSize(normalizedUri);
    const normalized = normalizeStaticFaceDetection(faceOval, face.bounds, face.landmarks);
    if (!normalized) {
      return failure("detection_failed");
    }

    const analysis = analyzeFaceContour(
      normalized.faceOval,
      normalized.bounds,
      normalized.landmarks,
    );
    if (!analysis) {
      return failure("detection_failed");
    }

    const classification = classifyFaceShape(analysis.measurements);

    if (__DEV__) {
      Logger.debug("Face shape detection success", {
        imageUri: normalizedUri,
        shape: classification.shape,
        alternateShape: classification.alternateShape,
        isBorderline: classification.isBorderline,
      });
    }

    return {
      status: "success",
      shape: classification.shape,
      alternateShape: classification.alternateShape,
      isBorderline: classification.isBorderline,
      overlay: analysis.overlay,
      imageSize,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isUnavailable =
      message.toLowerCase().includes("unavailable") ||
      message.toLowerCase().includes("not available") ||
      message.toLowerCase().includes("not linked");

    if (isUnavailable) {
      Logger.error(error instanceof Error ? error : message, { imageUri: normalizedUri });
      return failure("detector_unavailable");
    }

    Logger.error(error instanceof Error ? error : "Face shape detection failed", {
      error,
      imageUri: normalizedUri,
    });
    return failure("detection_failed");
  }
}
