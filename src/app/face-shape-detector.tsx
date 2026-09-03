import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  FaceShapeRecommendedStyles,
  FaceShapeScanAnalyzing,
  FaceShapeScanError,
  FaceShapeScanMissingDraft,
  FaceShapeScanResult,
  getRecommendedStyleIdsForFaceShapes,
  useFaceShapeScan,
} from "@/features/face-shape";
import { STYLE_DATA, type HairOption } from "@/features/hair-catalog";
import { setPendingLook } from "@/features/looks";
import { useTheme, type AppTheme } from "@/integrations/theme";

const HORIZONTAL_PADDING = 16;

const STYLE_CATALOG_IDS = STYLE_DATA.map((option) => option.id);

export default function FaceShapeDetectorScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { draftSource: draftSourceParam } = useLocalSearchParams<{
    draftSource?: string | string[];
  }>();
  const draftSource = Array.isArray(draftSourceParam) ? draftSourceParam[0] : draftSourceParam;
  const styles = createStyles(theme);
  const phase = useFaceShapeScan(draftSource);

  const handleTryAgain = useCallback(() => {
    router.replace({ pathname: "/camera", params: { intent: "face-shape" } });
  }, [router]);

  const recommendedOptions = useMemo(() => {
    if (phase.kind !== "result") {
      return [];
    }

    const recommendedStyleIds = getRecommendedStyleIdsForFaceShapes(
      phase.shape,
      phase.alternateShape,
      STYLE_CATALOG_IDS,
    );

    return recommendedStyleIds
      .map((styleId) => STYLE_DATA.find((option) => option.id === styleId))
      .filter((option): option is HairOption => option != null);
  }, [phase]);

  const openStyleInGallery = useCallback(
    (option: HairOption, photoUri: string) => {
      setPendingLook(option);
      router.push({
        pathname: "/draft",
        params: { draftSource: photoUri, source: "face_shape" },
      });
    },
    [router],
  );

  return (
    <View style={styles.root}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.container}>
        {phase.kind === "missing_draft" && (
          <FaceShapeScanMissingDraft onOpenCamera={handleTryAgain} />
        )}

        {phase.kind === "analyzing" && <FaceShapeScanAnalyzing photoUri={phase.photoUri} />}

        {phase.kind === "error" && (
          <FaceShapeScanError
            photoUri={phase.photoUri}
            reason={phase.reason}
            onTryAgain={handleTryAgain}
          />
        )}

        {phase.kind === "result" && (
          <FaceShapeScanResult phase={phase} onScanAgain={handleTryAgain}>
            <FaceShapeRecommendedStyles
              options={recommendedOptions}
              onSelect={(option) => openStyleInGallery(option, phase.photoUri)}
            />
          </FaceShapeScanResult>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flexGrow: 1,
      padding: HORIZONTAL_PADDING,
      backgroundColor: theme.colors.background,
    },
  });
