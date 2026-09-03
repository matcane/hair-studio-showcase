import type { HairOptionType, HairStyleLength, HairStyleTexture } from "@/shared/types";

export interface GallerySeedLook {
  uuid: string;
  createdAtOffsetMs: number;
  actionType: HairOptionType;
  actionId: string;
  actionTitle?: string;
  styleTexture?: HairStyleTexture;
  styleLength?: HairStyleLength;
  beforeFilename: string;
  afterFilename: string;
}

export const GALLERY_SEED_LOOKS: GallerySeedLook[] = [
  {
    uuid: "a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1",
    createdAtOffsetMs: 60 * 60 * 1000,
    actionType: "hair_change",
    actionId: "gorgeous_curls",
    styleTexture: "curly",
    styleLength: "medium",
    beforeFilename: "before.webp",
    afterFilename: "after.webp",
  },
  {
    uuid: "b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2",
    createdAtOffsetMs: 24 * 60 * 60 * 1000,
    actionType: "color_change",
    actionId: "soft_copper",
    beforeFilename: "before.webp",
    afterFilename: "after.webp",
  },
  {
    uuid: "c3c3c3c3-c3c3-43c3-83c3-c3c3c3c3c3c3",
    createdAtOffsetMs: 2 * 24 * 60 * 60 * 1000,
    actionType: "makeup_change",
    actionId: "soft_glam",
    beforeFilename: "before.webp",
    afterFilename: "after.webp",
  },
];
