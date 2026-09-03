import { useLocalSearchParams } from "expo-router";
import type { ParseKeys } from "i18next";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

import { CELEB_DATA } from "@/features/hair-catalog";
import type { LookMeta } from "@/features/looks";
import { useTheme, type AppTheme } from "@/integrations/theme";

interface DetailRowProps {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}

function DetailRow({ label, value, styles }: DetailRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function choiceLabelKey(actionType: LookMeta["actionType"]): ParseKeys<"main"> {
  if (actionType === "hair_change") return "gallery.details.style";
  if (actionType === "celebrity_hair_change") return "gallery.details.celeb";
  if (actionType === "makeup_change") return "gallery.details.makeup";
  if (actionType === "fun_change") return "gallery.details.fun";
  return "gallery.details.color";
}

function parseLookMeta(raw: string) {
  try {
    return JSON.parse(raw) as LookMeta;
  } catch {
    return undefined;
  }
}

export default function GalleryDetailsScreen() {
  const { meta } = useLocalSearchParams<{ meta: string }>();
  const { t } = useTranslation("main");
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  const lookMeta = parseLookMeta(meta);

  if (!lookMeta) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{t("gallery.details.empty")}</Text>
      </View>
    );
  }

  const createdAt = new Date(lookMeta.createdAt).toLocaleString();
  const actionTitle =
    lookMeta.actionType === "celebrity_hair_change"
      ? (lookMeta.actionTitle ??
        CELEB_DATA.find((celeb) => celeb.id === lookMeta.actionId)?.title ??
        lookMeta.actionId)
      : t(`hairCatalog.${lookMeta.actionType}.${lookMeta.actionId}.title` as ParseKeys<"main">);

  return (
    <View style={styles.content}>
      <Text style={styles.heading}>{t("gallery.details.heading")}</Text>

      {actionTitle ? (
        <DetailRow
          label={t(choiceLabelKey(lookMeta.actionType))}
          value={actionTitle}
          styles={styles}
        />
      ) : null}
      <DetailRow label={t("gallery.details.created")} value={createdAt} styles={styles} />
      {lookMeta.styleLength ? (
        <DetailRow
          label={t("gallery.details.length")}
          value={t(`hairFilters.length.${lookMeta.styleLength}` as ParseKeys<"main">)}
          styles={styles}
        />
      ) : null}
      {lookMeta.styleTexture ? (
        <DetailRow
          label={t("gallery.details.texture")}
          value={t(`hairFilters.type.${lookMeta.styleTexture}` as ParseKeys<"main">)}
          styles={styles}
        />
      ) : null}
    </View>
  );
}

const createStyles = (theme: AppTheme, insets: EdgeInsets) =>
  StyleSheet.create({
    content: {
      paddingTop: 32,
      paddingBottom: 0,
      paddingHorizontal: 20,
      gap: 12,
    },
    heading: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
    },
    row: {
      gap: 4,
    },
    label: {
      fontSize: 13,
      fontWeight: "500",
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    value: {
      fontSize: 17,
      fontWeight: "500",
      color: theme.colors.text,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingTop: insets.top + 24,
      paddingBottom: insets.bottom + 24,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
  });
