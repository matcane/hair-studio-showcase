import { Image as ExpoImage } from "expo-image";
import type { ParseKeys } from "i18next";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { useTheme, type AppTheme } from "@/integrations/theme";

const HORIZONTAL_PADDING = 16;
const GRID_GAP = 12;

export interface FaceShapeRecommendedStyle {
  id: string;
  type: string;
  image: number;
}

interface FaceShapeRecommendedStylesProps<T extends FaceShapeRecommendedStyle> {
  options: readonly T[];
  onSelect: (option: T) => void;
}

export function FaceShapeRecommendedStyles<T extends FaceShapeRecommendedStyle>({
  options,
  onSelect,
}: FaceShapeRecommendedStylesProps<T>) {
  const theme = useTheme();
  const { t } = useTranslation("main");
  const { width: windowWidth } = useWindowDimensions();
  const gridItemWidth = (windowWidth - HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;
  const styles = createStyles(theme, gridItemWidth);

  if (options.length === 0) {
    return null;
  }

  return (
    <>
      <Text style={styles.recommendedTitle}>{t("face-shape.forYou")}</Text>
      <View style={styles.recommendedGrid}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            style={styles.recommendedCard}
            onPress={() => onSelect(option)}>
            <ExpoImage source={option.image} contentFit="cover" style={styles.recommendedImage} />
            <View pointerEvents="none" style={styles.recommendedImageFade} />
            <Text style={styles.recommendedStyleTitle}>
              {t(`hairCatalog.${option.type}.${option.id}.title` as ParseKeys<"main">)}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const createStyles = (theme: AppTheme, gridItemWidth: number) =>
  StyleSheet.create({
    recommendedTitle: {
      fontSize: 20,
      lineHeight: 20 * 1.25,
      fontWeight: "600",
      color: theme.colors.text,
    },
    recommendedGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: GRID_GAP,
    },
    recommendedCard: {
      width: gridItemWidth,
      borderRadius: 20,
      borderCurve: "continuous",
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
    },
    recommendedImage: {
      width: "100%",
      aspectRatio: 1,
    },
    recommendedImageFade: {
      ...StyleSheet.absoluteFill,
      experimental_backgroundImage:
        "linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, transparent 55%)",
    },
    recommendedStyleTitle: {
      position: "absolute",
      left: 10,
      right: 10,
      bottom: 10,
      fontSize: 14,
      lineHeight: 14 * 1.25,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
