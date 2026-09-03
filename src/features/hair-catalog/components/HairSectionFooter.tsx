import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme, type AppTheme } from "@/integrations/theme";

interface HairSectionFooterProps {
  label: string;
  itemWidth: number;
  onPress: () => void;
}

export function HairSectionFooter({ label, itemWidth, onPress }: HairSectionFooterProps) {
  const theme = useTheme();
  const styles = createStyles(theme, itemWidth);

  return (
    <Pressable onPress={onPress} style={styles.seeAllContainer}>
      <View style={styles.seeAllFill}>
        <View style={styles.seeAllIconWrap}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.seeAllText}>{label}</Text>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme, itemWidth: number) =>
  StyleSheet.create({
    seeAllContainer: {
      width: itemWidth,
      height: (itemWidth * 3) / 2,
      borderRadius: 24,
      overflow: "hidden",
    },
    seeAllFill: {
      ...StyleSheet.absoluteFill,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    seeAllText: {
      fontSize: 16,
      lineHeight: 16 * 1.25,
      fontWeight: 600,
      color: theme.colors.primary,
      textAlign: "center",
    },
    seeAllIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${theme.colors.primary}1F`,
      justifyContent: "center",
      alignItems: "center",
    },
  });
