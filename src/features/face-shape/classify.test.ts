import { classifyFaceShape } from "./classify";
import type { FaceMeasurements } from "./measure";

describe("classifyFaceShape", () => {
  const oval: FaceMeasurements = {
    contourFaceLength: 142,
    upperFaceWidth: 90,
    cheekboneWidth: 100,
    jawWidth: 86,
    chinTaper: 0.6,
  };

  it("returns oval when measurements match the oval prototype", () => {
    expect(classifyFaceShape(oval)).toEqual({
      shape: "oval",
      isBorderline: false,
    });
  });

  it("returns a borderline diamond with oval as alternate", () => {
    expect(
      classifyFaceShape({
        ...oval,
        contourFaceLength: 140,
        chinTaper: 0.48,
      }),
    ).toEqual({
      shape: "diamond",
      alternateShape: "oval",
      isBorderline: true,
    });
  });
});
