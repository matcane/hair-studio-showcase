import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { useTheme, type AppTheme } from "@/integrations/theme";

import { HairCelebImageBottomSoften } from "./HairCelebImageBottomSoften";
import { StyleBadge } from "./StyleBadge";

export const HAIR_CARD_ASPECT_RATIO = 2 / 3;
export const HAIR_CARD_HEIGHT = 192;

interface HairCardProps {
  image: number;
  title: string;
  onPress: () => void;
  selected?: boolean;
  soften?: boolean;
  style?: StyleProp<ViewStyle>;
}

function HairCardComponent({
  image,
  title,
  onPress,
  selected = false,
  soften = false,
  style,
}: HairCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme, selected);

  return (
    <Pressable role="button" onPress={onPress} style={[styles.container, style]}>
      <Image
        source={image}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={{ duration: 200, effect: "cross-dissolve", timing: "ease-out" }}
      />
      {soften ? <HairCelebImageBottomSoften /> : null}
      <StyleBadge title={title} style={styles.badge} />
    </Pressable>
  );
}

export const HairCard = memo(HairCardComponent);

const createStyles = (theme: AppTheme, selected: boolean) =>
  StyleSheet.create({
    container: {
      aspectRatio: HAIR_CARD_ASPECT_RATIO,
      borderRadius: 26,
      borderCurve: "continuous",
      borderWidth: 4,
      borderColor: selected ? theme.colors.primary : "transparent",
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    badge: {
      position: "absolute",
      bottom: 12,
      left: 12,
    },
  });
