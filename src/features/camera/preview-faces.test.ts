import { interpretPreviewFaces, isRectFullyOnScreen, mapFaceToPreviewRect } from "./preview-faces";
import type { DetectedFace, FaceBounds, Size } from "./types";

describe("mapFaceToPreviewRect", () => {
  const face: DetectedFace = {
    bounds: { x: 40, y: 50, width: 80, height: 100 },
    frameWidth: 200,
    frameHeight: 300,
  };
  const previewSize: Size = { width: 200, height: 300 };

  it("returns the same rect when the preview matches the frame", () => {
    expect(mapFaceToPreviewRect(face, previewSize, false)).toEqual({
      x: 40,
      y: 50,
      width: 80,
      height: 100,
    });
  });

  it("flips x across the frame when mirrored", () => {
    expect(mapFaceToPreviewRect(face, previewSize, true)).toEqual({
      x: 80,
      y: 50,
      width: 80,
      height: 100,
    });
  });
});

describe("isRectFullyOnScreen", () => {
  const onScreen: FaceBounds = { x: 0, y: 0, width: 10, height: 10 };
  const previewSize: Size = { width: 200, height: 300 };

  it("returns true when the rect is fully on the screen", () => {
    expect(isRectFullyOnScreen(onScreen, previewSize)).toBe(true);
  });

  it("returns false when the rect is off the screen", () => {
    expect(isRectFullyOnScreen({ ...onScreen, x: -1 }, previewSize)).toBe(false);
  });
});

describe("interpretPreviewFaces", () => {
  const face: DetectedFace = {
    bounds: { x: 40, y: 50, width: 80, height: 100 },
    frameWidth: 200,
    frameHeight: 300,
  };
  const previewSize: Size = { width: 200, height: 300 };

  it("returns No face when the list is empty", () => {
    expect(interpretPreviewFaces([], previewSize, "front", false)).toEqual({
      ok: false,
      error: "No face",
    });
  });

  it("returns Too many faces when there are two", () => {
    expect(interpretPreviewFaces([face, face], previewSize, "front", false)).toEqual({
      ok: false,
      error: "Too many faces",
    });
  });

  it("returns Face out of frame when face are out of screen", () => {
    expect(
      interpretPreviewFaces(
        [{ ...face, bounds: { ...face.bounds, x: -1 } }],
        previewSize,
        "front",
        true,
      ),
    ).toEqual({
      ok: false,
      error: "Face out of frame",
    });
  });

  it("returns the only face", () => {
    expect(interpretPreviewFaces([face], previewSize, "front", true)).toEqual({
      ok: true,
      data: face,
    });
  });
});
