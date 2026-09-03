import { useCallback, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { useSharedValue, type SharedValue } from "react-native-reanimated";
import { type CameraOutput } from "react-native-vision-camera";
import { createFaceDetectorOutput, type Face } from "react-native-vision-camera-face-detector";

import { Logger } from "@/services/logger";
import { IS_IOS_SIMULATOR } from "@/shared/constants";

import { interpretPreviewFaces } from "../preview-faces";
import type { DetectedFace, FaceDetectionStatus } from "../types";

export type FaceDetectionState = FaceDetectionStatus | null;

interface UseFaceDetectionParams {
  facing: "front" | "back";
}

interface UseFaceDetectionResult {
  faceDetectorOutput: CameraOutput | null;
  detectedFace: SharedValue<DetectedFace | null>;
  faceDetectionStatus: FaceDetectionState;
  onPreviewLayout: (width: number, height: number) => void;
  resetFaceDetection: () => void;
}

export function useFaceDetection({ facing }: UseFaceDetectionParams): UseFaceDetectionResult {
  "use no memo";

  const detectedFace = useSharedValue<DetectedFace | null>(null);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<FaceDetectionState>(() =>
    IS_IOS_SIMULATOR ? "Face detected" : null,
  );

  const lastStatus = useRef<FaceDetectionState>(null);
  const detectorGenerationRef = useRef(0);
  const previewSizeRef = useRef({ width: 0, height: 0 });

  const resetFaceDetection = useCallback(() => {
    detectedFace.set(null);

    if (IS_IOS_SIMULATOR) {
      lastStatus.current = "Face detected";
      setFaceDetectionStatus("Face detected");
      return;
    }

    detectorGenerationRef.current += 1;
    lastStatus.current = null;
    setFaceDetectionStatus(null);
  }, [detectedFace]);

  const onPreviewLayout = useCallback((width: number, height: number) => {
    previewSizeRef.current = { width, height };
  }, []);

  const faceDetectorOutput = useMemo(() => {
    if (IS_IOS_SIMULATOR) {
      return null;
    }

    const generation = detectorGenerationRef.current;

    return createFaceDetectorOutput({
      cameraFacing: facing,
      performanceMode: "fast",
      outputResolution: "preview",
      autoMode: false,
      minFaceSize: 0.1,
      onFacesDetected(faces: Face[]) {
        if (generation !== detectorGenerationRef.current) return;

        const result = interpretPreviewFaces(
          faces,
          previewSizeRef.current,
          facing,
          Platform.OS === "android",
        );

        const status = result.ok ? "Face detected" : result.error;

        if (lastStatus.current !== status) {
          lastStatus.current = status;
          setFaceDetectionStatus(status);
        }

        detectedFace.set(result.ok ? result.data : null);
      },
      onError: (error) => Logger.error(error, { scope: "useFaceDetection" }),
    });
  }, [facing, detectedFace]);

  return {
    faceDetectorOutput,
    detectedFace,
    faceDetectionStatus,
    onPreviewLayout,
    resetFaceDetection,
  };
}
