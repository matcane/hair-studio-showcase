import Svg, { Ellipse, Path } from "react-native-svg";

import type { FaceShape } from "../types";

const VIEWBOX = "0 0 64 80";

const SHAPE_PATHS: Record<
  FaceShape,
  { d?: string; ellipse?: { cx: number; cy: number; rx: number; ry: number } }
> = {
  oval: {
    d: "M32 8 C50 8 56 26 56 42 C56 60 46 72 32 72 C18 72 8 60 8 42 C8 26 14 8 32 8 Z",
  },
  round: {
    ellipse: { cx: 32, cy: 40, rx: 26, ry: 28 },
  },
  square: {
    d: "M18 16 Q32 11 46 16 L52 34 Q54 40 52 46 L46 64 Q32 71 18 64 L12 46 Q10 40 12 34 Z",
  },
  heart: {
    d: "M32 70 C18 52 10 38 12 26 C14 14 24 10 32 12 C40 10 50 14 52 26 C54 38 46 52 32 70 Z",
  },
  diamond: {
    d: "M32 9 C44 18 52 32 52 40 C52 48 44 62 32 71 C20 62 12 48 12 40 C12 32 20 18 32 9 Z",
  },
  oblong: {
    ellipse: { cx: 32, cy: 40, rx: 20, ry: 32 },
  },
};

interface FaceShapeSilhouetteProps {
  shape: FaceShape;
  size?: number;
  stroke: string;
  fill: string;
  strokeWidth?: number;
  opacity?: number;
}

export function FaceShapeSilhouette({
  shape,
  size = 72,
  stroke,
  fill,
  strokeWidth = 1.75,
  opacity = 1,
}: FaceShapeSilhouetteProps) {
  const height = size * (80 / 64);
  const definition = SHAPE_PATHS[shape];

  return (
    <Svg width={size} height={height} viewBox={VIEWBOX} opacity={opacity}>
      {definition.ellipse ? (
        <Ellipse
          cx={definition.ellipse.cx}
          cy={definition.ellipse.cy}
          rx={definition.ellipse.rx}
          ry={definition.ellipse.ry}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={fill}
        />
      ) : (
        <Path
          d={definition.d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={fill}
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}
