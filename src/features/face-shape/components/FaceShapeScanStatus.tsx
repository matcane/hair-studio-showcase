import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image as ExpoImage } from "expo-image";
import type { ParseKeys } from "i18next";
import type { ComponentProps, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useTheme, type AppTheme } from "@/integrations/theme";
import { Button } from "@/shared/components/Button";

import type { FaceShapeDetectionFailureReason } from "../detect";

type GuidelineIcon = ComponentProps<typeof MaterialCommunityIcons>["name"];

const FAILURE_TIP_ICONS: Record<FaceShapeDetectionFailureReason, readonly GuidelineIcon[]> = {
  no_face: ["account-off-outline", "white-balance-sunny", "face-man-profile"],
  multiple_faces: ["account-group-outline", "crop", "face-recognition"],
  head_tilted: ["face-recognition", "rotate-left", "white-balance-sunny"],
  detection_failed: ["image-off-outline", "white-balance-sunny", "hair-dryer-outline"],
  detector_unavailable: ["cellphone", "refresh", "information-outline"],
};

interface FaceShapeScanMissingDraftProps {
  onOpenCamera: () => void;
}

export function FaceShapeScanMissingDraft({ onOpenCamera }: FaceShapeScanMissingDraftProps) {
  const theme = useTheme();
  const { t } = useTranslation("main");
  const styles = createStyles(theme);

  return (
    <ScanCentered styles={styles}>
      <View style={styles.introIconWrap}>
        <MaterialCommunityIcons name="face-recognition" size={44} color={theme.colors.primary} />
      </View>
      <Text style={styles.introTitle}>{t("face-shape.missingDraft.title")}</Text>
      <Text style={styles.introSubtitle}>{t("face-shape.missingDraft.subtitle")}</Text>
      <View style={styles.actionColumn}>
        <Button title={t("face-shape.missingDraft.openCamera")} onPress={onOpenCamera} />
      </View>
    </ScanCentered>
  );
}

interface FaceShapeScanAnalyzingProps {
  photoUri: string;
}

export function FaceShapeScanAnalyzing({ photoUri }: FaceShapeScanAnalyzingProps) {
  const theme = useTheme();
  const { t } = useTranslation("main");
  const styles = createStyles(theme);

  return (
    <ScanCentered styles={styles}>
      <ExpoImage source={{ uri: photoUri }} contentFit="cover" style={styles.avatar} />
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.analyzingText}>{t("face-shape.analyzing")}</Text>
    </ScanCentered>
  );
}

interface FaceShapeScanErrorProps {
  photoUri: string;
  reason: FaceShapeDetectionFailureReason;
  onTryAgain: () => void;
}

export function FaceShapeScanError({ photoUri, reason, onTryAgain }: FaceShapeScanErrorProps) {
  const theme = useTheme();
  const { t } = useTranslation("main");
  const styles = createStyles(theme);

  return (
    <ScanCentered styles={styles}>
      <ExpoImage source={{ uri: photoUri }} contentFit="cover" style={styles.avatar} />
      <Text style={styles.introTitle}>{t("face-shape.scanFailed")}</Text>
      <Text style={styles.introSubtitle}>
        {t(`face-shape.failures.${reason}.message` as ParseKeys<"main">)}
      </Text>
      <View style={styles.guidelineList}>
        {FAILURE_TIP_ICONS[reason].map((icon, index) => (
          <View key={index} style={styles.guidelineRow}>
            <MaterialCommunityIcons name={icon} size={22} color={theme.colors.primary} />
            <Text style={styles.guidelineText}>
              {t(`face-shape.failures.${reason}.tips.${index}` as ParseKeys<"main">)}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.actionColumn}>
        <Button title={t("face-shape.tryAgain")} onPress={onTryAgain} />
      </View>
    </ScanCentered>
  );
}

function ScanCentered({
  children,
  styles,
}: {
  children: ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return <View style={styles.centerSection}>{children}</View>;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    centerSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
      paddingHorizontal: 8,
      paddingVertical: 32,
    },
    introIconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
    },
    introTitle: {
      fontSize: 28,
      lineHeight: 28 * 1.25,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
    },
    introSubtitle: {
      fontSize: 15,
      lineHeight: 15 * 1.4,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    guidelineList: {
      alignSelf: "stretch",
      gap: 12,
      padding: 16,
      borderRadius: 20,
      borderCurve: "continuous",
      backgroundColor: theme.colors.surface,
    },
    guidelineRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    guidelineText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 14 * 1.35,
      color: theme.colors.text,
    },
    actionColumn: {
      alignSelf: "stretch",
      gap: 8,
      paddingTop: 8,
    },
    analyzingText: {
      fontSize: 16,
      lineHeight: 16 * 1.3,
      color: theme.colors.textSecondary,
    },
    avatar: {
      width: 128,
      height: 128,
      borderRadius: 64,
    },
  });
