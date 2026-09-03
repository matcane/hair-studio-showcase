import type { ParseKeys } from "i18next";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import type { FaceDetectionStatus } from "../types";

interface CameraDetectionStatusProps {
  status: FaceDetectionStatus;
}

export function CameraDetectionStatus({ status }: CameraDetectionStatusProps) {
  const { t } = useTranslation("main");

  return (
    <View style={styles.faceDetectionStatus}>
      <Text style={styles.faceDetectionStatusText}>
        {t(`camera.detectionStatus.${status}` as ParseKeys<"main">)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  faceDetectionStatus: {
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  faceDetectionStatusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
