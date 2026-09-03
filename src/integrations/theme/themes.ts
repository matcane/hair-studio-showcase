const darkTheme = {
  colors: {
    background: "#0D0D0D",
    surface: "#252525",

    text: "#FFFFFF",
    textSecondary: "#A0A0A0",
    textFlipped: "#2d2422",

    primary: "#FF6B9D",
    secondary: "#9D6BFF",

    success: "#4ADE80",
    error: "#F87171",
    warning: "#FBBF24",
  },
} as const;

const lightTheme = {
  colors: {
    background: "#FAF7F6",
    surface: "#FFFFFF",

    text: "#2d2422",
    textSecondary: "#6c6664",
    textFlipped: "#ffffff",

    primary: "#c78b81",
    secondary: "#E5E7EB",

    success: "#4ADE80",
    error: "#F87171",
    warning: "#FBBF24",
  },
} as const;

export const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

export type ThemeName = "dark" | "light";
export type AppTheme = typeof lightTheme | typeof darkTheme;
