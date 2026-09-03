import type { ParseKeys } from "i18next";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

import { useTheme, type AppTheme } from "@/integrations/theme";

import type { FaceShape } from "../types";
import { FaceShapeSilhouette } from "./FaceShapeSilhouette";

interface FaceShapeResultCardProps {
  shape: FaceShape;
  alternateShape?: FaceShape;
  isBorderline: boolean;
}

const TRAIT_INDEXES = ["0", "1", "2"] as const;

export function FaceShapeResultCard({
  shape,
  alternateShape,
  isBorderline,
}: FaceShapeResultCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation("main");
  const showDualShape = isBorderline && alternateShape;

  return (
    <View style={styles.card}>
      <Text style={styles.overline}>{t("face-shape.result.overline")}</Text>

      <View style={styles.silhouetteRow}>
        <View style={[styles.silhouetteWrap, showDualShape ? styles.silhouetteWrapPrimary : null]}>
          <FaceShapeSilhouette
            shape={shape}
            size={showDualShape ? 64 : 80}
            stroke={theme.colors.primary}
            fill={`${theme.colors.primary}22`}
          />
          {showDualShape ? (
            <Text style={styles.silhouetteLabel}>
              {t(`face-shape.shapes.${shape}.name` as ParseKeys<"main">)}
            </Text>
          ) : null}
        </View>

        {showDualShape && alternateShape ? (
          <>
            <Text style={styles.shapeDivider}>·</Text>
            <View style={styles.silhouetteWrap}>
              <FaceShapeSilhouette
                shape={alternateShape}
                size={64}
                stroke={theme.colors.textSecondary}
                fill={`${theme.colors.textSecondary}18`}
                opacity={0.85}
              />
              <Text style={[styles.silhouetteLabel, styles.silhouetteLabelAlternate]}>
                {t(`face-shape.shapes.${alternateShape}.name` as ParseKeys<"main">)}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {!showDualShape ? (
        <Text style={styles.shapeName}>
          {t(`face-shape.shapes.${shape}.name` as ParseKeys<"main">)}
        </Text>
      ) : null}

      {showDualShape && alternateShape ? (
        <View style={styles.contextBlock}>
          <Text style={styles.contextText}>
            {t("face-shape.result.combines", {
              primary: t(`face-shape.shapes.${shape}.name` as ParseKeys<"main">),
              alternate: t(`face-shape.shapes.${alternateShape}.name` as ParseKeys<"main">),
            })}
          </Text>
          <View style={styles.highlightList}>
            <HighlightRow
              label={t(`face-shape.shapes.${shape}.name` as ParseKeys<"main">)}
              detail={t(`face-shape.shapes.${shape}.highlight` as ParseKeys<"main">)}
              emphasized
              styles={styles}
            />
            <HighlightRow
              label={t(`face-shape.shapes.${alternateShape}.name` as ParseKeys<"main">)}
              detail={t(`face-shape.shapes.${alternateShape}.highlight` as ParseKeys<"main">)}
              styles={styles}
            />
          </View>
        </View>
      ) : (
        <Text style={styles.contextText}>
          {t(`face-shape.shapes.${shape}.summary` as ParseKeys<"main">)}
        </Text>
      )}

      <View style={styles.traitRow}>
        {TRAIT_INDEXES.map((index) => (
          <View key={index} style={styles.traitChip}>
            <Text style={styles.traitText}>
              {t(`face-shape.shapes.${shape}.traits.${index}` as ParseKeys<"main">)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

interface HighlightRowProps {
  label: string;
  detail: string;
  emphasized?: boolean;
  styles: ReturnType<typeof createStyles>;
}

function HighlightRow({ label, detail, emphasized, styles }: HighlightRowProps) {
  return (
    <View style={styles.highlightRow}>
      <View style={[styles.highlightDot, emphasized ? styles.highlightDotPrimary : null]} />
      <Text style={styles.highlightText}>
        <Text style={emphasized ? styles.highlightLabelPrimary : styles.highlightLabel}>
          {label}
        </Text>
        <Text style={styles.highlightDetail}>: {detail}</Text>
      </Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      alignItems: "center",
      gap: 14,
      paddingVertical: 24,
      paddingHorizontal: 20,
      borderRadius: 28,
      borderCurve: "continuous",
      backgroundColor: theme.colors.surface,
    },
    overline: {
      fontSize: 12,
      lineHeight: 12 * 1.3,
      fontWeight: "600",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: theme.colors.textSecondary,
    },
    silhouetteRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "center",
      gap: 10,
      minHeight: 96,
    },
    silhouetteWrap: {
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    silhouetteWrapPrimary: {
      transform: [{ scale: 1.02 }],
    },
    silhouetteLabel: {
      fontSize: 13,
      lineHeight: 13 * 1.25,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    silhouetteLabelAlternate: {
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    shapeDivider: {
      fontSize: 28,
      lineHeight: 28,
      color: theme.colors.textSecondary,
      opacity: 0.5,
      marginTop: 28,
    },
    shapeName: {
      fontSize: 32,
      lineHeight: 32 * 1.1,
      fontWeight: "700",
      color: theme.colors.text,
    },
    contextBlock: {
      alignSelf: "stretch",
      gap: 12,
    },
    contextText: {
      fontSize: 15,
      lineHeight: 15 * 1.45,
      textAlign: "center",
      color: theme.colors.textSecondary,
    },
    highlightList: {
      alignSelf: "stretch",
      gap: 8,
      paddingHorizontal: 4,
    },
    highlightRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    highlightDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 7,
      backgroundColor: theme.colors.textSecondary,
      opacity: 0.45,
    },
    highlightDotPrimary: {
      backgroundColor: theme.colors.primary,
      opacity: 1,
    },
    highlightText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 14 * 1.4,
      color: theme.colors.textSecondary,
    },
    highlightLabel: {
      fontWeight: "600",
      color: theme.colors.text,
    },
    highlightLabelPrimary: {
      fontWeight: "700",
      color: theme.colors.text,
    },
    highlightDetail: {
      color: theme.colors.textSecondary,
    },
    traitRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
    },
    traitChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: `${theme.colors.primary}18`,
    },
    traitText: {
      fontSize: 13,
      lineHeight: 13 * 1.25,
      fontWeight: "600",
      color: theme.colors.primary,
    },
  });
