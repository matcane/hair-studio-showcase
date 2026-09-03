import type { Result } from "@/shared/types";

import { DRAFT_ASPECT_RATIO } from "./constants";
import type { DetectedFace, FaceBounds, FaceError, Photo, PixelCrop, RawFace, Size } from "./types";

export function createSimulatorFace(photo: Photo): DetectedFace {
  const frameWidth = photo.width;
  const frameHeight = photo.height;

  const bounds: FaceBounds = {
    x: frameWidth * 0.3,
    y: frameHeight * 0.25,
    width: frameWidth * 0.4,
    height: frameHeight * 0.5,
  };

  return { bounds, frameWidth, frameHeight };
}

export function requireSingleFace(faces: RawFace[]): Result<RawFace, FaceError> {
  if (faces.length === 0) {
    return { ok: false, error: "No face" };
  }

  if (faces.length > 1) {
    return { ok: false, error: "Too many faces" };
  }

  return { ok: true, data: { bounds: faces[0].bounds } };
}

export function normalizeBounds(raw: FaceBounds, isIos: boolean): FaceBounds {
  if (!isIos) return raw;

  return { x: raw.y, y: raw.x, width: raw.width, height: raw.height };
}

export function toDetectedFace(raw: RawFace, photo: Photo, isIos: boolean): DetectedFace {
  return {
    bounds: normalizeBounds(raw.bounds, isIos),
    frameWidth: photo.width,
    frameHeight: photo.height,
  };
}

export function isFaceFullyInFrame(face: DetectedFace): boolean {
  return (
    face.bounds.x >= 0 &&
    face.bounds.y >= 0 &&
    face.bounds.x + face.bounds.width <= face.frameWidth &&
    face.bounds.y + face.bounds.height <= face.frameHeight
  );
}

export function largestFaceAwareCrop(face: DetectedFace): FaceBounds {
  const { bounds, frameWidth, frameHeight } = face;

  const imageAspect = frameWidth / frameHeight;
  let cropWidth: number;
  let cropHeight: number;

  if (imageAspect > DRAFT_ASPECT_RATIO) {
    cropHeight = frameHeight;
    cropWidth = frameHeight * DRAFT_ASPECT_RATIO;
  } else {
    cropWidth = frameWidth;
    cropHeight = frameWidth / DRAFT_ASPECT_RATIO;
  }

  const faceCenterX = bounds.x + bounds.width / 2;
  const faceCenterY = bounds.y + bounds.height / 2;
  const x = Math.max(0, Math.min(faceCenterX - cropWidth / 2, frameWidth - cropWidth));
  const y = Math.max(0, Math.min(faceCenterY - cropHeight / 2, frameHeight - cropHeight));

  return { x, y, width: cropWidth, height: cropHeight };
}

export function clampCrop(crop: FaceBounds, frame: Size): PixelCrop {
  const originX = Math.max(0, Math.min(Math.round(crop.x), frame.width - 1));
  const originY = Math.max(0, Math.min(Math.round(crop.y), frame.height - 1));
  const width = Math.max(1, Math.min(Math.round(crop.width), frame.width - originX));
  const height = Math.max(1, Math.min(Math.round(crop.height), frame.height - originY));

  return { originX, originY, width, height };
}
