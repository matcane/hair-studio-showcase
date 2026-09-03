import {
  clampCrop,
  createSimulatorFace,
  isFaceFullyInFrame,
  largestFaceAwareCrop,
  normalizeBounds,
  requireSingleFace,
  toDetectedFace,
} from "./photo-geometry";
import type { DetectedFace, Photo, RawFace } from "./types";

describe("createSimulatorFace", () => {
  const photo: Photo = { uri: "", width: 200, height: 300 };

  it("returns frame size and fractional bounds from the photo", () => {
    expect(createSimulatorFace(photo)).toEqual({
      bounds: { x: 60, y: 75, width: 80, height: 150 },
      frameWidth: 200,
      frameHeight: 300,
    });
  });
});

describe("requireSingleFace", () => {
  const face: RawFace = {
    bounds: { x: 0, y: 0, width: 10, height: 10 },
  };

  it("returns No face when the list is empty", () => {
    expect(requireSingleFace([])).toEqual({ ok: false, error: "No face" });
  });

  it("returns Too many faces when there are two", () => {
    expect(requireSingleFace([face, face])).toEqual({
      ok: false,
      error: "Too many faces",
    });
  });

  it("returns the only face", () => {
    expect(requireSingleFace([face])).toEqual({ ok: true, data: face });
  });
});

describe("normalizeBounds", () => {
  const bounds = { x: 1, y: 2, width: 3, height: 4 };

  it("returns the same bounds on Android", () => {
    expect(normalizeBounds(bounds, false)).toEqual(bounds);
  });

  it("swaps x and y on iOS", () => {
    expect(normalizeBounds(bounds, true)).toEqual({
      x: 2,
      y: 1,
      width: 3,
      height: 4,
    });
  });
});

describe("toDetectedFace", () => {
  const raw = { bounds: { x: 1, y: 2, width: 3, height: 4 } };
  const photo: Photo = { uri: "", width: 200, height: 300 };

  it("uses raw bounds on Android", () => {
    expect(toDetectedFace(raw, photo, false)).toEqual({
      bounds: { x: 1, y: 2, width: 3, height: 4 },
      frameWidth: 200,
      frameHeight: 300,
    });
  });

  it("swaps x and y on iOS", () => {
    expect(toDetectedFace(raw, photo, true)).toEqual({
      bounds: { x: 2, y: 1, width: 3, height: 4 },
      frameWidth: 200,
      frameHeight: 300,
    });
  });
});

describe("isFaceFullyInFrame", () => {
  const inFrame: DetectedFace = {
    bounds: { x: 40, y: 50, width: 80, height: 100 },
    frameWidth: 200,
    frameHeight: 300,
  };

  it("returns true when the face is fully in the frame", () => {
    expect(isFaceFullyInFrame(inFrame)).toBe(true);
  });

  it("returns false when the face is out of the frame", () => {
    expect(isFaceFullyInFrame({ ...inFrame, bounds: { ...inFrame.bounds, x: -1 } })).toBe(false);
  });
});

describe("largestFaceAwareCrop", () => {
  const toWide: DetectedFace = {
    bounds: { x: 160, y: 80, width: 80, height: 100 },
    frameWidth: 400,
    frameHeight: 300,
  };

  it("crops a wide frame to 2:3 centered on the face", () => {
    expect(largestFaceAwareCrop(toWide)).toEqual({ x: 100, y: 0, width: 200, height: 300 });
  });

  const toTall: DetectedFace = {
    bounds: { x: 40, y: 150, width: 80, height: 100 },
    frameWidth: 200,
    frameHeight: 400,
  };

  it("crops a tall frame to 2:3 centered on the face", () => {
    expect(largestFaceAwareCrop(toTall)).toEqual({ x: 0, y: 50, width: 200, height: 300 });
  });
});

describe("clampCrop", () => {
  const frame = { width: 100, height: 100 };

  it("rounds a crop that already fits the frame", () => {
    expect(clampCrop({ x: 10.4, y: 20.6, width: 30.2, height: 40.8 }, frame)).toEqual({
      originX: 10,
      originY: 21,
      width: 30,
      height: 41,
    });
  });

  it("clamps a crop that extends past the frame", () => {
    expect(clampCrop({ x: -10, y: -10, width: 1000, height: 1000 }, frame)).toEqual({
      originX: 0,
      originY: 0,
      width: 100,
      height: 100,
    });
  });
});
