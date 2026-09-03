import type { HairOptionType, HairStyleLength, HairStyleTexture } from "@/shared/types";

export interface HairOption {
  id: string;
  type: HairOptionType;
  title: string;
  image: number;
  styleTexture?: HairStyleTexture;
  styleLength?: HairStyleLength;
}
