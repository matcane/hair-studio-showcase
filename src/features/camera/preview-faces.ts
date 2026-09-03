import type { DetectedFace, DetectedFaceResult, FaceBounds, Size } from "./types";

export function mapFaceToPreviewRect(
  face: DetectedFace,
  previewSize: Size,
  mirrorX: boolean,
): FaceBounds {
  const { bounds, frameWidth, frameHeight } = face;
  const { width: layoutWidth, height: layoutHeight } = previewSize;

  const originX = mirrorX ? frameWidth - bounds.x - bounds.width : bounds.x;
  const coverScale = Math.max(layoutWidth / frameWidth, layoutHeight / frameHeight);

  return {
    x: originX * coverScale - (frameWidth * coverScale - layoutWidth) / 2,
    y: bounds.y * coverScale - (frameHeight * coverScale - layoutHeight) / 2,
    width: bounds.width * coverScale,
    height: bounds.height * coverScale,
  };
}

export function isRectFullyOnScreen(rect: FaceBounds, previewSize: Size): boolean {
  const { x, y, width, height } = rect;

  return x >= 0 && y >= 0 && x + width <= previewSize.width && y + height <= previewSize.height;
}

export function interpretPreviewFaces(
  faces: DetectedFace[],
  previewSize: Size,
  facing: "front" | "back",
  isAndroid: boolean,
): DetectedFaceResult {
  if (faces.length === 0) return { ok: false, error: "No face" };
  if (faces.length > 1) return { ok: false, error: "Too many faces" };

  const face = faces[0];

  // Front camera: iOS ML Kit already mirrors faces; Android reports sensor space.
  const mirrorX = isAndroid && facing === "front";
  const rect = mapFaceToPreviewRect(face, previewSize, mirrorX);

  const onScreen =
    previewSize.width > 1 && previewSize.height > 1 && isRectFullyOnScreen(rect, previewSize);

  return onScreen ? { ok: true, data: face } : { ok: false, error: "Face out of frame" };
}
