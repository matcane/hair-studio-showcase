import type { ImageSource } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

import { useTheme, type AppTheme } from "@/integrations/theme";
import { Button } from "@/shared/components/Button";
import { ComparisonImageSlider } from "@/shared/components/ComparisonImageSlider";

import { OnboardingState } from "../store";

const COMPARISON_ASPECT_RATIO = 3 / 4;
const HEADER_MIN_HEIGHT = 148;

interface OnboardingComparisonStepProps {
  stepIndex: number;
  title: string;
  titleAccent: string;
  subtitle: string;
  cta: string;
  leftSource: ImageSource;
  rightSource: ImageSource;
  onContinue: () => void;
}

export function OnboardingComparisonStep({
  stepIndex,
  title,
  titleAccent,
  subtitle,
  cta,
  leftSource,
  rightSource,
  onContinue,
}: OnboardingComparisonStepProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);

  useFocusEffect(
    useCallback(() => {
      OnboardingState().setProgress("default", stepIndex);
      return () => {};
    }, [stepIndex]),
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
          <Text style={styles.titleAccent}>{titleAccent}</Text>
        </Text>

        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.main}>
        <View style={styles.comparisonFrame}>
          <ComparisonImageSlider
            leftSource={leftSource}
            rightSource={rightSource}
            borderRadius={32}
            handleColor={theme.colors.primary}
          />
        </View>
      </View>

      <Button title={cta} onPress={onContinue} />
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme, insets: EdgeInsets) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flexGrow: 1,
      gap: 24,
      paddingHorizontal: 24,
      paddingBottom: Math.max(insets.bottom, 24),
      backgroundColor: theme.colors.background,
    },
    header: {
      gap: 12,
      minHeight: HEADER_MIN_HEIGHT,
      justifyContent: "flex-start",
    },
    title: {
      fontSize: 36,
      lineHeight: 36 * 1.25,
      color: theme.colors.text,
    },
    titleAccent: {
      fontStyle: "italic",
      color: theme.colors.primary,
    },
    subtitle: {
      fontSize: 20,
      lineHeight: 20 * 1.25,
      color: theme.colors.textSecondary,
    },
    main: {
      flexGrow: 1,
      justifyContent: "center",
    },
    comparisonFrame: {
      width: "100%",
      aspectRatio: COMPARISON_ASPECT_RATIO,
    },
  });
