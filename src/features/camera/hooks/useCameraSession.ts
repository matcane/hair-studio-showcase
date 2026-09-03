import { useCallback, useMemo, useRef, useState } from "react";
import {
  CommonResolutions,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
  type FlashMode,
} from "react-native-vision-camera";

import { takePhoto } from "../capture";
import { getCaptureFlash, nextFlashMode, waitForScreenFlashReady } from "../flash";
import { pickLibraryPhoto } from "../gallery";
import { promptCameraPermission } from "../permission";
import { prepareDraftPhoto } from "../prepare-draft";
import type { FaceError, Photo } from "../types";
import { useFaceDetection } from "./useFaceDetection";

interface CameraSession {
  onPhotoReady: (uri: string, source: "camera" | "gallery") => void;
  onError: (error: FaceError | "capture-failed") => void;
  onGalleryPermissionDenied: () => void;
  onCameraPermissionDenied: () => void;
}

export function useCameraSession({
  onPhotoReady,
  onError,
  onGalleryPermissionDenied,
  onCameraPermissionDenied,
}: CameraSession) {
  const [facing, setFacing] = useState<"front" | "back">("front");

  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [showScreenFlash, setShowScreenFlash] = useState(false);

  const isCapturingRef = useRef(false);
  const [isPreparingDraft, setIsPreparingDraft] = useState(false);

  const device = useCameraDevice(facing);
  const photoOutput = usePhotoOutput({
    targetResolution: CommonResolutions.HIGHEST_4_3,
  });

  const {
    faceDetectorOutput,
    detectedFace,
    faceDetectionStatus,
    onPreviewLayout,
    resetFaceDetection,
  } = useFaceDetection({
    facing,
  });

  const outputs = useMemo(
    () => (faceDetectorOutput ? [photoOutput, faceDetectorOutput] : [photoOutput]),
    [photoOutput, faceDetectorOutput],
  );

  const canCapture = faceDetectionStatus === "Face detected";

  const { hasPermission, requestPermission } = useCameraPermission();

  const resetSession = useCallback(() => {
    isCapturingRef.current = false;
    setIsPreparingDraft(false);
    setShowScreenFlash(false);
  }, []);

  async function commitPhoto(photo: Photo, source: "camera" | "gallery") {
    setIsPreparingDraft(true);
    const result = await prepareDraftPhoto(photo);
    if (!result.ok) {
      isCapturingRef.current = false;
      setIsPreparingDraft(false);
      onError(result.error);
      return;
    }
    onPhotoReady(result.data, source);
  }

  const handleCameraFlip = () => {
    if (isPreparingDraft || isCapturingRef.current) return;

    resetFaceDetection();
    setShowScreenFlash(false);
    setFlashMode("off");
    setFacing((position) => (position === "back" ? "front" : "back"));
  };

  const handleFlashToggle = () => {
    if (isPreparingDraft || isCapturingRef.current) return;

    setFlashMode((current) => nextFlashMode(current));
  };

  const handleGallery = async () => {
    if (isPreparingDraft || isCapturingRef.current) return;

    const picked = await pickLibraryPhoto();
    if (!picked.ok) {
      if (picked.error === "permanently-denied") {
        onGalleryPermissionDenied();
      }

      return;
    }

    isCapturingRef.current = true;

    await commitPhoto(picked.data, "gallery");
  };

  const handleCapture = async () => {
    if (!canCapture || isPreparingDraft || isCapturingRef.current) return;

    isCapturingRef.current = true;

    const { useScreenFlash, captureFlashMode } = getCaptureFlash(facing, flashMode);

    if (useScreenFlash) {
      setShowScreenFlash(true);
      await waitForScreenFlashReady();
    }

    const taken = await takePhoto(photoOutput, captureFlashMode);

    setShowScreenFlash(false);

    if (!taken.ok) {
      isCapturingRef.current = false;
      setIsPreparingDraft(false);
      onError("capture-failed");
      return;
    }

    await commitPhoto(taken.data, "camera");
  };

  const handleCameraPermission = async () => {
    const status = await promptCameraPermission(requestPermission);

    if (status === "permanently-denied") {
      onCameraPermissionDenied();
    }
  };

  return {
    device,
    outputs,
    facing,
    flashMode,
    showScreenFlash,
    isPreparingDraft,
    hasPermission,
    canCapture,
    detectedFace,
    faceDetectionStatus,
    resetSession,
    onPreviewLayout,
    handleCameraFlip,
    handleFlashToggle,
    handleGallery,
    handleCapture,
    handleCameraPermission,
  };
}
