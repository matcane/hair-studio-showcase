import { create } from "zustand";

import { globalStorage } from "@/services/storage";

import type { ThemeName } from "./themes";

type ThemeStore = {
  themeName: ThemeName;
  hasAdaptiveThemes: boolean;
  setTheme: (themeName: ThemeName) => void;
  setAdaptiveThemes: (hasAdaptiveThemes: boolean) => void;
};

// const DEFAULT_THEME_NAME: ThemeName = Appearance.getColorScheme() ?? "light";
const DEFAULT_THEME_NAME: ThemeName = "light";
const DEFAULT_HAS_ADAPTIVE_THEMES = false;

const INITIAL_VALUES = {
  themeName: (globalStorage.getString("themeName") as ThemeName) ?? DEFAULT_THEME_NAME,
  hasAdaptiveThemes: globalStorage.getBoolean("hasAdaptiveThemes") ?? DEFAULT_HAS_ADAPTIVE_THEMES,
};

export const useThemeStore = create<ThemeStore>((set) => ({
  ...INITIAL_VALUES,
  setTheme: (themeName) => {
    globalStorage.set("themeName", themeName);
    set({ themeName });
  },
  setAdaptiveThemes: (hasAdaptiveThemes) => {
    globalStorage.set("hasAdaptiveThemes", hasAdaptiveThemes);
    set({ hasAdaptiveThemes });
  },
}));

export const ThemeState = useThemeStore.getState;
