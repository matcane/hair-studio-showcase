import type { Result } from "@/shared/types";

export interface Size {
  width: number;
  height: number;
}

export interface FaceBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedFace {
  bounds: FaceBounds;
  frameWidth: number;
  frameHeight: number;
}

export type FaceDetectionStatus =
  "No face" | "Face detected" | "Face out of frame" | "Too many faces";

export type FaceError = Exclude<FaceDetectionStatus, "Face detected">;

export interface Photo {
  uri: string;
  width: number;
  height: number;
}

export interface RawFace {
  bounds: FaceBounds;
}

export interface PixelCrop {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export interface CropToDraftInput {
  uri: string;
  crop: PixelCrop;
}

export type DetectedFaceResult = Result<DetectedFace, FaceError>;
export type PrepareDraftPhotoResult = Result<string, FaceError>;
