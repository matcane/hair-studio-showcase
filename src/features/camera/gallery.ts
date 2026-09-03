import * as ImagePicker from "expo-image-picker";

import type { Result } from "@/shared/types";

import type { Photo } from "./types";

type PickLibraryPhotoResult = Result<Photo, "permanently-denied" | "canceled">;

export async function pickLibraryPhoto(): Promise<PickLibraryPhotoResult> {
  const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
  const permission = existing.granted
    ? existing
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return {
      ok: false,
      error: existing.status === "denied" ? "permanently-denied" : "canceled",
    };
  }

  const pickedImage = await ImagePicker.launchImageLibraryAsync();

  if (pickedImage.canceled || !pickedImage.assets[0]) {
    return { ok: false, error: "canceled" };
  }

  return { ok: true, data: pickedImage.assets[0] };
}
