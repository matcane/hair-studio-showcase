import { getRecommendedStyleIdsForFaceShapes } from "./style-recommendations";

describe("getRecommendedStyleIdsForFaceShapes", () => {
  const catalogIds = ["wolf_cut", "gorgeous_curls", "buzz_cut", "beach_waves", "curtain_bangs"];

  it("returns matching styles in catalog order without duplicates", () => {
    expect(getRecommendedStyleIdsForFaceShapes("oval", undefined, catalogIds)).toEqual([
      "wolf_cut",
      "beach_waves",
    ]);
  });

  it("includes styles that match either the primary or alternate shape", () => {
    expect(getRecommendedStyleIdsForFaceShapes("oval", "square", catalogIds)).toEqual([
      "wolf_cut",
      "gorgeous_curls",
      "beach_waves",
    ]);
  });

  it("omits catalog ids that are not in the face-shape map", () => {
    expect(getRecommendedStyleIdsForFaceShapes("heart", undefined, catalogIds)).toEqual([
      "wolf_cut",
      "curtain_bangs",
    ]);
  });
});
