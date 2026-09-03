import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { PostHogProvider, PostHogSurveyProvider } from "posthog-react-native";
import { useCallback, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { featureFlags } from "react-native-screens";

import { useAppStateRuntime } from "@/core/appState";
import { useOnboardingStore } from "@/features/onboarding";
import "@/integrations/i18n";
import { useMigrationsInitializer, useSQLiteStore } from "@/integrations/sqlite";
import { syncRootBackgroundColorAsync, useTheme, useThemeStore } from "@/integrations/theme";
import { useScreenTracking } from "@/services/analytics";
import { posthog } from "@/services/analytics/providers";
import "react-native-reanimated";

// Hand native bottom-tab selection control to JS. Without this, iOS UIKit owns
// the selected tab and ignores JS navigation, so the "+" action tab cannot run
// custom logic and bounce back instead of opening a blank screen. The SDK 56
// `NativeTabs.Trigger` `disabled` prop is the long-term replacement.
featureFlags.experiment.controlledBottomTabs = true;

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false,
  enabled: !__DEV__,
});

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function SurveyProvider({ children }: PropsWithChildren) {
  if (!posthog) return children;

  return (
    <PostHogProvider client={posthog} autocapture={false}>
      <PostHogSurveyProvider>{children}</PostHogSurveyProvider>
    </PostHogProvider>
  );
}

function RootNavigation() {
  const theme = useTheme();

  const { t } = useTranslation("main");

  const isOnboardingCompleted = useOnboardingStore((state) => state.isOnboardingCompleted);

  useScreenTracking();

  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerShown: false,
        }}>
        <Stack.Protected guard={!isOnboardingCompleted}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        <Stack.Protected guard={isOnboardingCompleted}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        <Stack.Screen
          name="catalog/[type]"
          options={{
            headerBackButtonDisplayMode: "minimal",
            animation: "slide_from_bottom",
            headerShown: true,
            headerShadowVisible: false,
          }}
        />

        <Stack.Screen
          name="face-shape-detector"
          options={{
            title: t("navigation.faceShape"),
            headerShown: true,
            headerShadowVisible: false,
            headerBackButtonDisplayMode: "minimal",
          }}
        />

        <Stack.Screen
          name="camera"
          options={{
            title: "",
            headerBackVisible: false,
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            animation: "none",
          }}
        />

        <Stack.Screen
          name="(gallery)/draft"
          options={{
            title: "",
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            animation: "slide_from_bottom",
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="(gallery)/preview"
          options={{
            title: "",
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
            animation: "fade",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(gallery)/details"
          options={{
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetAllowedDetents: "fitToContents",
            headerTransparent: true,
          }}
        />
      </Stack>
    </>
  );
}

function RootLayout() {
  const themeName = useThemeStore((state) => state.themeName);

  const barStyle = themeName === "dark" ? "light" : "dark";

  const migrationStatus = useSQLiteStore((state) => state.migration.status);

  const onLayoutRootView = useCallback(async () => {
    await syncRootBackgroundColorAsync();
    await SplashScreen.hideAsync();
  }, []);

  if (migrationStatus === "pending") return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <SurveyProvider>
            <StatusBar style={barStyle} />
            <QueryClientProvider client={queryClient}>
              <RootNavigation />
            </QueryClientProvider>
          </SurveyProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

function Root() {
  useAppStateRuntime();

  useMigrationsInitializer();

  return <RootLayout />;
}

export default Sentry.wrap(Root);
