import { Image as ExpoImage } from "expo-image";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Button } from "@/shared/components/Button";

import { FaceShapePhotoOverlay } from "./FaceShapePhotoOverlay";
import { FaceShapeResultCard } from "./FaceShapeResultCard";
import type { FaceShapeScanPhase } from "../hooks/useFaceShapeScan";

type ResultPhase = Extract<FaceShapeScanPhase, { kind: "result" }>;

interface FaceShapeScanResultProps {
  phase: ResultPhase;
  onScanAgain: () => void;
  children?: ReactNode;
}

export function FaceShapeScanResult({ phase, onScanAgain, children }: FaceShapeScanResultProps) {
  const { t } = useTranslation("main");

  return (
    <View style={styles.resultSection}>
      {phase.overlay ? (
        <FaceShapePhotoOverlay
          photoUri={phase.photoUri}
          overlay={phase.overlay}
          imageSize={phase.imageSize}
        />
      ) : (
        <ExpoImage
          source={{ uri: phase.photoUri }}
          contentFit="cover"
          style={styles.fallbackPhoto}
        />
      )}

      <FaceShapeResultCard
        shape={phase.shape}
        alternateShape={phase.alternateShape}
        isBorderline={phase.isBorderline}
      />

      {children}

      <Button variant="secondary" title={t("face-shape.scanAgain")} onPress={onScanAgain} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackPhoto: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 24,
    borderCurve: "continuous",
  },
  resultSection: {
    gap: 20,
    paddingBottom: 24,
  },
});
