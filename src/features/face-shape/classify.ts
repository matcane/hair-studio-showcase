import type { FaceMeasurements } from "./measure";
import type { FaceShape } from "./types";

/**
 * Core ratios used for prototype distance scoring.
 * Derived features (gaps, width shares, jaw/forehead) were dropped —
 * they duplicated these five signals.
 */
interface FaceShapeFeatures {
  /** Contour face length / cheekbone width */
  lengthRatio: number;
  /** Upper face width / cheekbone width */
  foreheadToCheek: number;
  /** Jaw width / cheekbone width */
  jawToCheek: number;
  /** Chin width / jaw width */
  chinTaper: number;
  /** (cheek − max(forehead, jaw)) / cheek — positive when cheeks are widest */
  cheekPeakRatio: number;
}

interface ShapePrototype {
  features: FaceShapeFeatures;
  tolerances: FaceShapeFeatures;
  weights: FaceShapeFeatures;
}

export interface FaceShapeClassification {
  shape: FaceShape;
  alternateShape?: FaceShape;
  isBorderline: boolean;
}

const ALL_SHAPES: FaceShape[] = ["oval", "round", "square", "heart", "diamond", "oblong"];

/** Runner-up score / winner score ≥ this → borderline result */
const BORDERLINE_SCORE_RATIO = 0.84;

const DEFAULT_TOLERANCES: FaceShapeFeatures = {
  lengthRatio: 0.22,
  foreheadToCheek: 0.1,
  jawToCheek: 0.1,
  chinTaper: 0.14,
  cheekPeakRatio: 0.07,
};

const DEFAULT_WEIGHTS: FaceShapeFeatures = {
  lengthRatio: 1,
  foreheadToCheek: 1,
  jawToCheek: 1,
  chinTaper: 0.8,
  cheekPeakRatio: 1,
};

const SHAPE_PROTOTYPES: Record<FaceShape, ShapePrototype> = {
  round: {
    features: {
      lengthRatio: 1.1,
      foreheadToCheek: 0.94,
      jawToCheek: 0.86,
      chinTaper: 0.52,
      cheekPeakRatio: 0.02,
    },
    tolerances: DEFAULT_TOLERANCES,
    weights: {
      ...DEFAULT_WEIGHTS,
      lengthRatio: 1.2,
      jawToCheek: 1.4,
      chinTaper: 1.5,
    },
  },
  square: {
    features: {
      lengthRatio: 1.2,
      foreheadToCheek: 0.96,
      jawToCheek: 0.94,
      chinTaper: 0.76,
      cheekPeakRatio: 0.01,
    },
    tolerances: DEFAULT_TOLERANCES,
    weights: {
      ...DEFAULT_WEIGHTS,
      jawToCheek: 2,
      chinTaper: 2.2,
    },
  },
  oval: {
    features: {
      lengthRatio: 1.42,
      foreheadToCheek: 0.9,
      jawToCheek: 0.86,
      chinTaper: 0.6,
      cheekPeakRatio: 0.03,
    },
    tolerances: DEFAULT_TOLERANCES,
    weights: {
      ...DEFAULT_WEIGHTS,
      lengthRatio: 1.3,
      cheekPeakRatio: 1.2,
    },
  },
  oblong: {
    features: {
      lengthRatio: 1.72,
      foreheadToCheek: 0.92,
      jawToCheek: 0.88,
      chinTaper: 0.62,
      cheekPeakRatio: 0.02,
    },
    tolerances: DEFAULT_TOLERANCES,
    weights: {
      ...DEFAULT_WEIGHTS,
      lengthRatio: 2.2,
    },
  },
  heart: {
    features: {
      lengthRatio: 1.36,
      foreheadToCheek: 1.05,
      jawToCheek: 0.76,
      chinTaper: 0.44,
      cheekPeakRatio: -0.06,
    },
    tolerances: {
      ...DEFAULT_TOLERANCES,
      foreheadToCheek: 0.06,
      jawToCheek: 0.08,
    },
    weights: {
      ...DEFAULT_WEIGHTS,
      foreheadToCheek: 2.2,
      jawToCheek: 2.2,
      chinTaper: 1.6,
      cheekPeakRatio: 1.8,
    },
  },
  diamond: {
    features: {
      lengthRatio: 1.4,
      foreheadToCheek: 0.9,
      jawToCheek: 0.86,
      chinTaper: 0.48,
      cheekPeakRatio: 0.04,
    },
    tolerances: {
      ...DEFAULT_TOLERANCES,
      cheekPeakRatio: 0.06,
      foreheadToCheek: 0.08,
    },
    weights: {
      ...DEFAULT_WEIGHTS,
      cheekPeakRatio: 2.4,
      foreheadToCheek: 1.6,
      jawToCheek: 1.4,
      chinTaper: 1.2,
    },
  },
};

function buildFeatures(measurements: FaceMeasurements): FaceShapeFeatures {
  const { contourFaceLength, upperFaceWidth, cheekboneWidth, jawWidth, chinTaper } = measurements;
  const maxUpperLower = Math.max(upperFaceWidth, jawWidth);

  return {
    lengthRatio: contourFaceLength / cheekboneWidth,
    foreheadToCheek: upperFaceWidth / cheekboneWidth,
    jawToCheek: jawWidth / cheekboneWidth,
    chinTaper,
    cheekPeakRatio: (cheekboneWidth - maxUpperLower) / cheekboneWidth,
  };
}

function scoreShape(features: FaceShapeFeatures, prototype: ShapePrototype): number {
  let weightedSum = 0;
  let weightTotal = 0;

  const keys = Object.keys(prototype.features) as (keyof FaceShapeFeatures)[];

  for (const key of keys) {
    const weight = prototype.weights[key];
    const tolerance = Math.max(prototype.tolerances[key], 0.001);
    const delta = Math.abs(features[key] - prototype.features[key]);
    weightedSum += weight * Math.max(0, 1 - delta / tolerance);
    weightTotal += weight;
  }

  return weightTotal > 0 ? weightedSum / weightTotal : 0;
}

export function classifyFaceShape(measurements: FaceMeasurements): FaceShapeClassification {
  const features = buildFeatures(measurements);

  const ranked = ALL_SHAPES.map((shape) => ({
    shape,
    score: scoreShape(features, SHAPE_PROTOTYPES[shape]),
  })).sort((a, b) => b.score - a.score);

  const [first, second] = ranked;
  if (!first) {
    return { shape: "oval", isBorderline: false };
  }

  if (!second || second.score <= 0) {
    return { shape: first.shape, isBorderline: false };
  }

  const isBorderline = second.score / first.score >= BORDERLINE_SCORE_RATIO;

  return {
    shape: first.shape,
    alternateShape: isBorderline ? second.shape : undefined,
    isBorderline,
  };
}
