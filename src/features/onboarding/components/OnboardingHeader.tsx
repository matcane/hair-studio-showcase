import { HeaderBackButton } from "@react-navigation/elements";
import { GlassView } from "expo-glass-effect";
import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/integrations/theme";
import type { AppTheme } from "@/integrations/theme/themes";

const HEADER_SIDE_SLOT_WIDTH = 56;
/** Matches GlassView padding + HeaderBackButton so layout stays stable without mounting a hidden control. */
const BACK_SLOT_MIN_HEIGHT = 52;

export interface OnboardingHeaderProps extends PropsWithChildren {
  onBack?: () => void;
}

export function OnboardingHeader({ children, onBack }: OnboardingHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);

  return (
    <View style={styles.header}>
      <View style={styles.leadingSlot}>
        {onBack ? (
          <GlassView isInteractive style={styles.glassContainer}>
            <HeaderBackButton onPress={onBack} tintColor={theme.colors.text} />
          </GlassView>
        ) : null}
      </View>

      <View style={styles.centerSlot}>{children}</View>

      <View style={styles.leadingSlot} />
    </View>
  );
}

const createStyles = (theme: AppTheme, insets: EdgeInsets) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 12,
      paddingTop: insets.top,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      zIndex: 1000,
    },
    leadingSlot: {
      width: HEADER_SIDE_SLOT_WIDTH,
      minHeight: BACK_SLOT_MIN_HEIGHT,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    centerSlot: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    glassContainer: {
      padding: 4,
      borderRadius: 99,
      justifyContent: "center",
      alignItems: "center",
    },
  });
