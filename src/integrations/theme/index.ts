import * as SystemUI from "expo-system-ui";
import { useColorScheme, type ColorValue } from "react-native";

import { ThemeState, useThemeStore } from "./store";
import { appThemes, type ThemeName } from "./themes";

export const ThemeBackgroundColors: Record<ThemeName, ColorValue> = {
  light: appThemes.light.colors.background,
  dark: appThemes.dark.colors.background,
};

export async function syncRootBackgroundColorAsync() {
  const themeName = ThemeState().themeName;

  await SystemUI.setBackgroundColorAsync(ThemeBackgroundColors[themeName]);
}

export function useTheme(overrideThemeName?: ThemeName) {
  const { hasAdaptiveThemes, themeName: currentThemeName } = useThemeStore();
  const colorSchemeName = useColorScheme();
  const colorScheme = colorSchemeName !== "unspecified" ? colorSchemeName : "light";

  const themeName = hasAdaptiveThemes ? colorScheme : currentThemeName;

  const isValidThemeName = themeName && themeName in appThemes;
  const effectiveThemeKey = isValidThemeName ? themeName : (colorScheme ?? "light");

  if (overrideThemeName) return appThemes[overrideThemeName];
  return appThemes[effectiveThemeKey];
}

export * from "./store";
export * from "./themes";
