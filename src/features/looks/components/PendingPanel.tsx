import type { ParseKeys } from "i18next";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

import { useTheme, type AppTheme } from "@/integrations/theme";
import { Button, BUTTON_HEIGHT } from "@/shared/components/Button";
import type { HairOptionType } from "@/shared/types";

interface PendingPanelProps {
  optionType?: HairOptionType;
  collapsing: boolean;
  onClose: () => void;
}

export function PendingPanel({ optionType, collapsing, onClose }: PendingPanelProps) {
  const { t } = useTranslation("main");

  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);

  return (
    <Animated.View
      entering={collapsing ? undefined : FadeIn.duration(240)}
      exiting={collapsing ? undefined : FadeOut.duration(180)}
      style={styles.panelPending}>
      <Text style={styles.title}>
        {t(`gallery.creating.title.${optionType ?? "hair_change"}` as ParseKeys<"main">)}
      </Text>
      <Text style={styles.subtitle}>{t("gallery.creating.subtitle")}</Text>
      {!collapsing ? (
        <View style={styles.pendingCtaRow}>
          <Button title={t("gallery.creating.cta")} onPress={onClose} />
        </View>
      ) : null}
    </Animated.View>
  );
}

const createStyles = (theme: AppTheme, insets: EdgeInsets) =>
  StyleSheet.create({
    panelPending: {
      gap: 12,
      paddingTop: 24,
      paddingBottom: 16 + insets.bottom,
      paddingHorizontal: 16,
      alignItems: "center",
    },

    pendingCtaRow: {
      alignSelf: "stretch",
      marginTop: 4,
      minHeight: BUTTON_HEIGHT,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
  });
