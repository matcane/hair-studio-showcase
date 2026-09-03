import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { memo } from "react";
import { Platform, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

interface HairTitleBadgeProps {
  title: string;
  style?: StyleProp<ViewStyle>;
}

function HairTitleBadgeComponent({ title, style }: HairTitleBadgeProps) {
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView style={[styles.container, style]}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </GlassView>
    );
  }

  return (
    <BlurView tint="systemUltraThinMaterialDark" intensity={60} style={[styles.container, style]}>
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
    </BlurView>
  );
}

export const StyleBadge = memo(HairTitleBadgeComponent);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: "85%",
    overflow: "hidden",
  },
  title: {
    fontSize: 14,
    lineHeight: 14 * 1.2,
    fontWeight: "600",
    color: Platform.select({ ios: "#000000", android: "#FFFFFF" }),
  },
});
