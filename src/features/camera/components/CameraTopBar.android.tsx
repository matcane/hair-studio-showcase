import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";
import type { FlashMode } from "react-native-vision-camera";

import { CameraDetectionStatus } from "./CameraDetectionStatus";
import type { FaceDetectionState } from "../hooks/useFaceDetection";

type FlashIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const FLASH_ICONS: Record<FlashMode, FlashIconName> = {
  off: "flash-off",
  on: "flash",
  auto: "flash-auto",
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
    <View style={styles.topBar}>
      <View style={styles.topBarSide}>
        <Pressable style={styles.topBarButton} onPress={handleFlashToggle}>
          <MaterialCommunityIcons name={FLASH_ICONS[flashMode]} size={28} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.topBarCenter} pointerEvents="none">
        {detectionStatus ? <CameraDetectionStatus status={detectionStatus} /> : null}
      </View>

      <View style={[styles.topBarSide, styles.topBarSideEnd]}>
        <Pressable style={styles.topBarButton} onPress={handleClose}>
          <MaterialCommunityIcons name="close" size={28} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    topBar: {
      position: "absolute",
      top: insets.top,
      left: 0,
      right: 0,
      zIndex: 2,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    topBarSide: {
      width: 44,
      alignItems: "flex-start",
    },
    topBarSideEnd: {
      alignItems: "flex-end",
    },
    topBarCenter: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 8,
    },
    topBarButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.35)",
    },
  });
