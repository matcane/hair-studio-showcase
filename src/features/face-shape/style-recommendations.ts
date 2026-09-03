import type { FaceShape } from "./types";

/**
 * Which face shapes each hairstyle flatters.
 *
 * When adding a style to STYLE_DATA, add one entry here with matching `id`.
 * Styles omitted from this map never appear in face-shape recommendations.
 */
const FACE_SHAPE_STYLE_MAP: Record<string, FaceShape[]> = {
  wolf_cut: ["square", "heart", "oval"],
  beach_waves: ["oval", "square"],
  butterfly_cut: ["round", "oval"],
  curly_bob: ["square", "diamond", "oblong"],
  french_bob: ["heart", "oval", "oblong"],
  pixie_cut: ["round", "oval"],
  gorgeous_curls: ["square"],
  shag: ["square", "heart"],
  long_bob: ["round", "heart"],
  curtain_bangs: ["heart", "diamond", "oblong"],
};

/** Catalog styles that match the scan result, in catalog order, without duplicates. */
export function getRecommendedStyleIdsForFaceShapes(
  primary: FaceShape,
  alternate: FaceShape | undefined,
  orderedCatalogStyleIds: readonly string[],
): string[] {
  const shapes = alternate ? [primary, alternate] : [primary];
  const matching = new Set<string>();

  for (const [styleId, forShapes] of Object.entries(FACE_SHAPE_STYLE_MAP)) {
    if (shapes.some((shape) => forShapes.includes(shape))) {
      matching.add(styleId);
    }
  }

  return orderedCatalogStyleIds.filter((styleId) => matching.has(styleId));
}
