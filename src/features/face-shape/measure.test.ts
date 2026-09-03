import type { Landmarks } from "react-native-vision-camera-face-detector";

import {
  analyzeFaceContour,
  mapPackageLandmarks,
  type FaceLandmarks,
  type FacePoint,
} from "./measure";

const landmarks: FaceLandmarks = {
  LEFT_EYE: { x: 30, y: 30 },
  RIGHT_EYE: { x: 70, y: 30 },
  LEFT_CHEEK: { x: 25, y: 50 },
  RIGHT_CHEEK: { x: 75, y: 50 },
  MOUTH_BOTTOM: { x: 50, y: 70 },
};

describe("analyzeFaceContour", () => {
  function rectangleOval(width: number, height: number): FacePoint[] {
    return [
      { x: 0, y: 0 },
      { x: width / 2, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height / 2 },
      { x: width, y: height },
      { x: width / 2, y: height },
      { x: 0, y: height },
      { x: 0, y: height / 2 },
    ];
  }

  it("returns equal widths for a rectangular oval", () => {
    const result = analyzeFaceContour(
      rectangleOval(100, 100),
      { x: 0, y: 0, width: 100, height: 100 },
      landmarks,
    );

    expect(result?.measurements).toEqual({
      contourFaceLength: 100,
      upperFaceWidth: 100,
      cheekboneWidth: 100,
      jawWidth: 100,
      chinTaper: 1,
    });
  });

  it("returns undefined when the oval has too few points", () => {
    expect(
      analyzeFaceContour(
        rectangleOval(100, 100).slice(0, 4),
        { x: 0, y: 0, width: 100, height: 100 },
        landmarks,
      ),
    ).toBeUndefined();
  });
});

describe("mapPackageLandmarks", () => {
  it("returns the required landmarks when every key is present", () => {
    expect(mapPackageLandmarks(landmarks)).toEqual(landmarks);
  });

  it("returns undefined when a required key is missing", () => {
    const { LEFT_EYE: _, ...rest } = landmarks;
    expect(mapPackageLandmarks(rest as Landmarks)).toBeUndefined();
  });
});
