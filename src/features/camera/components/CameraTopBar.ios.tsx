import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";
import type { FlashMode } from "react-native-vision-camera";
import type { SFSymbol } from "sf-symbols-typescript";

import { CameraDetectionStatus } from "./CameraDetectionStatus";
import type { FaceDetectionState } from "../hooks/useFaceDetection";

const FLASH_SF_ICONS: Record<FlashMode, SFSymbol> = {
  off: "bolt.slash.fill",
  on: "bolt.fill",
  auto: "bolt.badge.automatic.fill",
};

interface CameraTopBarProps {
  flashMode: FlashMode;
  detectionStatus: FaceDetectionState;
  handleFlashToggle: () => void;
  handleClose: () => void;
}

export function CameraTopBar({
  flashMode,
  detectionStatus,
  handleFlashToggle,
  handleClose,
}: CameraTopBarProps) {
  const insets = useSafeAreaInsets();
  const styles = createStyles(insets);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon={FLASH_SF_ICONS[flashMode]} onPress={handleFlashToggle} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="xmark" onPress={handleClose} />
      </Stack.Toolbar>
      {detectionStatus ? (
        <View style={styles.faceDetectionStatusIos} pointerEvents="none">
          <CameraDetectionStatus status={detectionStatus} />
        </View>
      ) : null}
    </>
  );
}

const createStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    faceDetectionStatusIos: {
      position: "absolute",
      top: insets.top,
      left: 72,
      right: 72,
      alignItems: "center",
    },
  });
