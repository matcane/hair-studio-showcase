import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { useTheme } from "@/integrations/theme";

export default function SettingsTabStack() {
  const theme = useTheme();

  const { t } = useTranslation("main");

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerShown: false,
        headerTransparent: true,
      }}>
      <Stack.Screen
        name="index"
        options={
          Platform.OS === "ios"
            ? {
                headerTitle: t("navigation.settings"),
                headerShown: true,
                headerShadowVisible: false,
                headerTitleStyle: {
                  fontSize: 36,
                  fontWeight: "bold",
                  color: theme.colors.text,
                },
              }
            : undefined
        }
      />
    </Stack>
  );
}
