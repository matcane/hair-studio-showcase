import { useCallback, useEffect, useState } from "react";

import {
  detectFaceShapeFromImage,
  type FaceShapeDetectionFailureReason,
  type FaceShapeDetectionSuccess,
} from "../detect";

export type FaceShapeScanPhase =
  | { kind: "analyzing"; photoUri: string }
  | ({ kind: "result"; photoUri: string } & Omit<FaceShapeDetectionSuccess, "status">)
  | { kind: "error"; reason: FaceShapeDetectionFailureReason; photoUri: string }
  | { kind: "missing_draft" };

export function useFaceShapeScan(draftSource: string | undefined) {
  const [phase, setPhase] = useState<FaceShapeScanPhase>(() =>
    draftSource ? { kind: "analyzing", photoUri: draftSource } : { kind: "missing_draft" },
  );

  const runAnalysis = useCallback(async (photoUri: string) => {
    setPhase({ kind: "analyzing", photoUri });

    const detection = await detectFaceShapeFromImage(photoUri);

    if (detection.status === "failure") {
      setPhase({ kind: "error", reason: detection.reason, photoUri });
      return;
    }

    const { status: _status, ...result } = detection;
    setPhase({ kind: "result", photoUri, ...result });
  }, []);

  useEffect(() => {
    if (!draftSource) {
      setPhase({ kind: "missing_draft" });
      return;
    }

    void runAnalysis(draftSource);
  }, [draftSource, runAnalysis]);

  return phase;
}
