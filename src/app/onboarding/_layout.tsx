import { router, Stack, usePathname } from "expo-router";

import { OnboardingHeader, OnboardingPageDots } from "@/features/onboarding";
import { useTheme } from "@/integrations/theme";

export default function OnboardingLayout() {
  const theme = useTheme();
  const pathname = usePathname();
  const isFirstStep = pathname === "/onboarding";

  return (
    <>
      <OnboardingHeader onBack={isFirstStep ? undefined : () => router.back()}>
        <OnboardingPageDots progressKey="default" />
      </OnboardingHeader>

      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="hair-color" />
        <Stack.Screen name="make-up" />
      </Stack>
    </>
  );
}
