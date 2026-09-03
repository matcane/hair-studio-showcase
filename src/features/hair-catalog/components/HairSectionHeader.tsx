import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme, type AppTheme } from "@/integrations/theme";

interface HairSectionHeaderProps {
  title: string;
  moreLabel?: string;
  onPressMore?: () => void;
}

export function HairSectionHeader({ title, moreLabel, onPressMore }: HairSectionHeaderProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.subHeader}>
      <Text style={styles.title}>{title}</Text>
      {onPressMore && (
        <Pressable onPress={onPressMore} style={styles.link}>
          <Text style={styles.subtitle}>{moreLabel}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    subHeader: {
      paddingHorizontal: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      lineHeight: 24 * 1.25,
      fontWeight: 600,
      color: theme.colors.text,
    },
    link: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    subtitle: {
      fontSize: 18,
      lineHeight: 18 * 1.25,
      fontWeight: 600,
      color: theme.colors.primary,
    },
  });
