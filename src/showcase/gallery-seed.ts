import { eq } from "drizzle-orm";
import { Asset } from "expo-asset";
import { File } from "expo-file-system";

import { lookDirectory } from "@/features/looks/api";
import { sqliteDb } from "@/integrations/sqlite";
import { hairGenerations } from "@/sqlite/schema";

import { GALLERY_SEED_LOOKS } from "./gallery-seed-data";

const SEED_IMAGE_MODULES: Record<string, { before: number; after: number }> = {
  "a1a1a1a1-a1a1-41a1-81a1-a1a1a1a1a1a1": {
    before: require("@/assets/images/onboarding_comprasion_left.webp"),
    after: require("@/assets/images/onboarding_comprasion_right.webp"),
  },
  "b2b2b2b2-b2b2-42b2-82b2-b2b2b2b2b2b2": {
    before: require("@/assets/images/onboarding_comprasion2_left.webp"),
    after: require("@/assets/images/onboarding_comprasion2_right.webp"),
  },
  "c3c3c3c3-c3c3-43c3-83c3-c3c3c3c3c3c3": {
    before: require("@/assets/images/onboarding_clean_girl.webp"),
    after: require("@/assets/images/onboarding_soft_glam.webp"),
  },
};

export async function seedLooksGalleryIfEmpty() {
  const existingReady = await sqliteDb
    .select({ uuid: hairGenerations.uuid })
    .from(hairGenerations)
    .where(eq(hairGenerations.status, "ready"))
    .limit(1);

  if (existingReady.length > 0) return false;

  const now = Date.now();

  for (const look of GALLERY_SEED_LOOKS) {
    const images = SEED_IMAGE_MODULES[look.uuid];
    if (!images) {
      throw new Error(`Missing seed images for ${look.uuid}`);
    }

    const directory = lookDirectory(look.uuid);
    directory.create({ intermediates: true, idempotent: true });

    await copyBundledImage(images.before, new File(directory, look.beforeFilename));
    await copyBundledImage(images.after, new File(directory, look.afterFilename));

    await sqliteDb.insert(hairGenerations).values({
      uuid: look.uuid,
      status: "ready",
      createdAt: now - look.createdAtOffsetMs,
      actionType: look.actionType,
      actionId: look.actionId,
      actionTitle: look.actionTitle,
      styleTexture: look.styleTexture,
      styleLength: look.styleLength,
      beforeFilename: look.beforeFilename,
      afterFilename: look.afterFilename,
    });
  }

  return true;
}

async function copyBundledImage(moduleId: number, destination: File) {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();

  if (!asset.localUri) {
    throw new Error("Bundled look image is missing");
  }

  if (destination.exists) {
    destination.delete();
  }

  new File(asset.localUri).copy(destination);
}
