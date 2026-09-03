import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme, type AppTheme } from "@/integrations/theme";

export function FaceShapeDetectorCard() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation("main");

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="creation" size={14} color={theme.colors.primary} />
          <Text style={styles.badgeText}>{t("face-shape.badge")}</Text>
        </View>
        <Text style={styles.title}>{t("face-shape.title")}</Text>
        <Text style={styles.description}>{t("face-shape.description")}</Text>
        <Link href={{ pathname: "/camera", params: { intent: "face-shape" } }} asChild>
          <Pressable style={styles.button}>
            <MaterialCommunityIcons
              name="face-recognition"
              size={18}
              color={theme.colors.textFlipped}
            />
            <Text style={styles.buttonText}>{t("face-shape.cta")}</Text>
          </Pressable>
        </Link>
      </View>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/face_shape_detector.webp")}
          contentFit="cover"
          style={styles.image}
        />
        <View style={styles.imageFade} />
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderCurve: "continuous",
      overflow: "hidden",
    },
    content: {
      flex: 1,
      padding: 16,
      gap: 12,
      alignItems: "flex-start",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: `${theme.colors.primary}1F`,
    },
    badgeText: {
      fontSize: 12,
      lineHeight: 12 * 1.3,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    title: {
      fontSize: 24,
      lineHeight: 24 * 1.2,
      fontWeight: "700",
      color: theme.colors.text,
    },
    description: {
      fontSize: 14,
      lineHeight: 14 * 1.4,
      color: theme.colors.textSecondary,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: theme.colors.text,
    },
    buttonText: {
      fontSize: 15,
      lineHeight: 15 * 1.2,
      fontWeight: "600",
      color: theme.colors.textFlipped,
    },
    imageContainer: {
      width: "42%",
    },
    image: {
      ...StyleSheet.absoluteFillObject,
    },
    imageFade: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: "45%",
      experimental_backgroundImage: `linear-gradient(to right, ${theme.colors.surface} 0%, transparent 100%)`,
    },
  });
