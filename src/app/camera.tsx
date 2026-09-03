import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { ParseKeys } from "i18next";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Linking, Platform, StyleSheet, Text, View } from "react-native";
import { Camera } from "react-native-vision-camera";

import {
  CameraBottomBar,
  CameraTopBar,
  FaceBoundingBoxOverlay,
  useCameraSession,
} from "@/features/camera";
import { clearPendingLook, CloseToolbar } from "@/features/looks";
import { useTheme, type AppTheme } from "@/integrations/theme";
import { Analytics } from "@/services/analytics";
import type { DraftOpenedSource } from "@/services/analytics/types";
import { Button } from "@/shared/components/Button";

export default function CameraScreen() {
  const { t } = useTranslation("main");
  const router = useRouter();
  const { intent, source } = useLocalSearchParams<{
    intent?: string;
    source?: DraftOpenedSource;
  }>();
  const draftDestination = intent === "face-shape" ? "/face-shape-detector" : "/draft";

  const { resetSession, ...session } = useCameraSession({
    onPhotoReady: (uri, photoSource) => {
      if (photoSource === "camera") Analytics.track("camera_photo_captured", {});
      router.navigate({
        pathname: draftDestination,
        params: draftDestination === "/draft" ? { draftSource: uri, source } : { draftSource: uri },
      });
    },
    onError: (error) => {
      if (error === "capture-failed") {
        Alert.alert(t("camera.captureFailed.title"), t("camera.captureFailed.message"));
        return;
      }
      Alert.alert(t("camera.cantUsePhoto"), t(`camera.errors.${error}` as ParseKeys<"main">));
    },
    onGalleryPermissionDenied: () => {
      Alert.alert(
        t("camera.galleryPermissionAlert.title"),
        t("camera.galleryPermissionAlert.message"),
        [
          { text: t("camera.galleryPermissionAlert.notNow"), style: "cancel" },
          {
            text: t("camera.galleryPermissionAlert.openSettings"),
            onPress: () => Linking.openSettings(),
          },
        ],
      );
    },
    onCameraPermissionDenied: () => {
      Alert.alert(t("camera.permissionAlert.title"), t("camera.permissionAlert.message"), [
        { text: t("camera.permissionAlert.notNow"), style: "cancel" },
        { text: t("camera.permissionAlert.openSettings"), onPress: () => Linking.openSettings() },
      ]);
    },
  });

  const theme = useTheme();
  const styles = createStyles(theme);

  useFocusEffect(
    useCallback(() => {
      Analytics.track("camera_opened", {});
      resetSession();

      return () => resetSession();
    }, [resetSession]),
  );

  const handleClose = () => {
    clearPendingLook();
    router.back();
  };

  if (!session.hasPermission) {
    return (
      <View style={styles.permission}>
        <CloseToolbar onPress={handleClose} />

        <Text style={styles.permissionText}>{t("camera.permissionRequired")}</Text>
        <Button title={t("camera.grantPermission")} onPress={session.handleCameraPermission} />
      </View>
    );
  }

  if (!session.device) {
    return (
      <View style={styles.permission}>
        <CloseToolbar onPress={handleClose} />

        {Platform.OS === "ios" ? (
          <Stack.Toolbar placement="bottom">
            <Stack.Toolbar.Button
              icon="photo.on.rectangle.angled"
              onPress={session.handleGallery}
            />
          </Stack.Toolbar>
        ) : null}

        <Text style={styles.permissionText}>{t("camera.noDevice")}</Text>
      </View>
    );
  }

  return (
    <View
      style={styles.root}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        session.onPreviewLayout(width, height);
      }}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={session.device}
        isActive={!session.isPreparingDraft}
        outputs={session.outputs}
      />

      <FaceBoundingBoxOverlay detectedFace={session.detectedFace} cameraFacing={session.facing} />

      <CameraTopBar
        flashMode={session.flashMode}
        detectionStatus={session.isPreparingDraft ? null : session.faceDetectionStatus}
        handleFlashToggle={session.handleFlashToggle}
        handleClose={handleClose}
      />

      <CameraBottomBar
        canCapture={session.canCapture}
        handleCapture={session.handleCapture}
        handleGallery={session.handleGallery}
        handleCameraFlip={session.handleCameraFlip}
      />

      {session.showScreenFlash ? (
        <View style={styles.screenFlash} pointerEvents="none" accessibilityElementsHidden />
      ) : null}

      {session.isPreparingDraft && (
        <View style={styles.preparingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    permission: {
      flex: 1,
      gap: 16,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      backgroundColor: theme.colors.background,
    },
    permissionText: {
      color: theme.colors.text,
    },
    preparingOverlay: {
      ...StyleSheet.absoluteFill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    screenFlash: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "#FFFFFF",
      zIndex: 100,
      elevation: 100,
    },
  });
