import type { CameraPhotoOutput, FlashMode } from "react-native-vision-camera";

import type { Result } from "@/shared/types";

import type { Photo } from "./types";

type TakePhotoResult = Result<Photo, "capture-failed">;

export async function takePhoto(
  photoOutput: CameraPhotoOutput,
  flashMode: FlashMode,
): Promise<TakePhotoResult> {
  try {
    const photo = await photoOutput.capturePhoto({ enableShutterSound: true, flashMode }, {});

    const filePath = await photo.saveToTemporaryFileAsync();

    const { width, height } = photo;

    photo.dispose();

    return { ok: true, data: { uri: `file://${filePath}`, width, height } };
  } catch {
    return { ok: false, error: "capture-failed" };
  }
}
