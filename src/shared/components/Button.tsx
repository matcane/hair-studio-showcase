import type { ReactNode } from "react";
import { Pressable, PressableProps, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/integrations/theme";
import type { AppTheme } from "@/integrations/theme/themes";

export const BUTTON_HEIGHT = 56;

export interface ButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary";
  /** When set, replaces the default `title` text (e.g. animated loading label). */
  titleContent?: ReactNode;
  /** Optional leading icon or node; if set (or `trailingSlot` is), title and icons render in a row. */
  leadingSlot?: ReactNode;
  /** Optional trailing icon or node; if set (or `leadingSlot` is), title and icons render in a row. */
  trailingSlot?: ReactNode;
  /** Max lines for `title` (default 1). */
  titleNumberOfLines?: number;
}

export function Button({
  title,
  variant = "primary",
  titleContent,
  leadingSlot,
  trailingSlot,
  titleNumberOfLines,
  ...pressableProps
}: ButtonProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const hasLeading = leadingSlot != null;
  const hasTrailing = trailingSlot != null;
  const hasInlineSlots = hasLeading || hasTrailing;
  const titleLines = titleNumberOfLines ?? 1;

  return (
    <Pressable
      role="button"
      style={({ pressed }) => [
        styles.button,
        styles.buttonFixedHeight,
        hasInlineSlots && styles.buttonSlotStretch,
        variant === "primary" ? styles.primary : styles.secondary,
        pressed && styles.buttonPressed,
      ]}
      {...pressableProps}>
      {hasInlineSlots ? (
        <View style={styles.slotRow}>
          {hasLeading ? leadingSlot : hasTrailing ? <View style={styles.slotBalance} /> : null}
          <Text
            style={[
              styles.buttonText,
              variant === "secondary" && styles.buttonTextSecondary,
              styles.buttonTextInSlotRow,
            ]}
            numberOfLines={titleLines}>
            {title}
          </Text>
          {hasTrailing ? trailingSlot : hasLeading ? <View style={styles.slotBalance} /> : null}
        </View>
      ) : titleContent != null ? (
        titleContent
      ) : (
        <Text
          style={[styles.buttonText, variant === "secondary" && styles.buttonTextSecondary]}
          numberOfLines={titleLines}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    button: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 12,
      borderRadius: 24,
    },
    buttonFixedHeight: {
      height: BUTTON_HEIGHT,
    },
    buttonSlotStretch: {
      alignSelf: "stretch",
    },
    primary: {
      alignSelf: "stretch",
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    buttonPressed: {
      transform: [{ scale: 0.98 }],
    },
    buttonText: {
      fontSize: 18,
      color: theme.colors.textFlipped,
    },
    buttonTextSecondary: {
      color: theme.colors.primary,
    },
    buttonTextInSlotRow: {
      flexShrink: 1,
      textAlign: "center",
    },
    slotRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      width: "100%",
    },
    slotBalance: {
      width: 22,
      height: 22,
    },
  });
