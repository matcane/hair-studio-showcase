import type { HairOptionType, HairStyleLength, HairStyleTexture } from "@/shared/types";

export interface LookMeta {
  uuid: string;
  createdAt: number;
  actionType: HairOptionType;
  actionId: string;
  actionTitle?: string;
  styleTexture?: HairStyleTexture;
  styleLength?: HairStyleLength;
}

export interface PendingLook {
  id: string;
  type: HairOptionType;
  title: string;
  styleTexture?: HairStyleTexture;
  styleLength?: HairStyleLength;
}
