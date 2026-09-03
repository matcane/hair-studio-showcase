import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";
import { createImageFaceDetector } from "react-native-vision-camera-face-detector";

import { IS_IOS_SIMULATOR } from "@/shared/constants";

import { DRAFT_HEIGHT, DRAFT_WIDTH } from "./constants";
import {
  clampCrop,
  createSimulatorFace,
  isFaceFullyInFrame,
  largestFaceAwareCrop,
  requireSingleFace,
  toDetectedFace,
} from "./photo-geometry";
import type {
  CropToDraftInput,
  DetectedFaceResult,
  Photo,
  PrepareDraftPhotoResult,
  RawFace,
} from "./types";

export async function maybeUprightOnIos(photo: Photo, isIos: boolean): Promise<Photo> {
  if (!isIos) return photo;

  const image = await ImageManipulator.manipulate(photo.uri).renderAsync();
  return image.saveAsync({ format: SaveFormat.JPEG, compress: 1 });
}

export function detectFaces(uri: string): RawFace[] {
  const faceDetector = createImageFaceDetector();
  return faceDetector.detectFaces(uri);
}

export async function cropToDraft(input: CropToDraftInput): Promise<string> {
  const { uri, crop } = input;

  const context = ImageManipulator.manipulate(uri);
  context.crop(crop);

  if (crop.width > DRAFT_WIDTH || crop.height > DRAFT_HEIGHT) {
    context.resize({ width: DRAFT_WIDTH, height: DRAFT_HEIGHT });
  }

  const image = await context.renderAsync();
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
  return result.uri;
}

export function analyzePhoto(photo: Photo, isIos: boolean): DetectedFaceResult {
  if (IS_IOS_SIMULATOR) return { ok: true, data: createSimulatorFace(photo) };

  const faces = detectFaces(photo.uri);

  const detected = requireSingleFace(faces);

  if (!detected.ok) return detected;

  const face = toDetectedFace(detected.data, photo, isIos);

  if (!isFaceFullyInFrame(face)) {
    return { ok: false, error: "Face out of frame" };
  }

  return { ok: true, data: face };
}

export async function prepareDraftPhoto(photo: Photo): Promise<PrepareDraftPhotoResult> {
  const isIos = Platform.OS === "ios";

  const source = await maybeUprightOnIos(photo, isIos);
  const face = analyzePhoto(source, isIos);

  if (!face.ok) return face;

  const crop = largestFaceAwareCrop(face.data);
  const pixelCrop = clampCrop(crop, { width: face.data.frameWidth, height: face.data.frameHeight });
  const draftUri = await cropToDraft({ uri: source.uri, crop: pixelCrop });

  return { ok: true, data: draftUri };
}
