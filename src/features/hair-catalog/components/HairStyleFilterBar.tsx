import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MenuView, type MenuAction, type NativeActionEvent } from "@react-native-menu/menu";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { useTheme, type AppTheme } from "@/integrations/theme";
import type { HairStyleLength, HairStyleTexture } from "@/shared/types";

import type { HairOption } from "../types";

interface HairStyleFilterBarProps {
  selectedTexture: HairStyleTexture | null;
  selectedLength: HairStyleLength | null;
  onSelectTexture: (value: HairStyleTexture | null) => void;
  onSelectLength: (value: HairStyleLength | null) => void;
}

type OpenMenu = "length" | "type" | null;

const LENGTH_IDS = {
  all: "length-all",
  short: "length-short",
  medium: "length-medium",
  long: "length-long",
} as const;

const TEXTURE_IDS = {
  all: "texture-all",
  straight: "texture-straight",
  wavy: "texture-wavy",
  curly: "texture-curly",
} as const;

function lengthActions(
  selectedLength: HairStyleLength | null,
  label: (key: "all" | "short" | "medium" | "long") => string,
): MenuAction[] {
  return [
    {
      id: LENGTH_IDS.all,
      title: label("all"),
      state: selectedLength === null ? "on" : "off",
    },
    {
      id: LENGTH_IDS.short,
      title: label("short"),
      state: selectedLength === "short" ? "on" : "off",
    },
    {
      id: LENGTH_IDS.medium,
      title: label("medium"),
      state: selectedLength === "medium" ? "on" : "off",
    },
    {
      id: LENGTH_IDS.long,
      title: label("long"),
      state: selectedLength === "long" ? "on" : "off",
    },
  ];
}

function textureActions(
  selectedTexture: HairStyleTexture | null,
  label: (key: "all" | "straight" | "wavy" | "curly") => string,
): MenuAction[] {
  return [
    {
      id: TEXTURE_IDS.all,
      title: label("all"),
      state: selectedTexture === null ? "on" : "off",
    },
    {
      id: TEXTURE_IDS.straight,
      title: label("straight"),
      state: selectedTexture === "straight" ? "on" : "off",
    },
    {
      id: TEXTURE_IDS.wavy,
      title: label("wavy"),
      state: selectedTexture === "wavy" ? "on" : "off",
    },
    {
      id: TEXTURE_IDS.curly,
      title: label("curly"),
      state: selectedTexture === "curly" ? "on" : "off",
    },
  ];
}

export function filterHairStyleOptions(
  items: HairOption[],
  texture: HairStyleTexture | null,
  length: HairStyleLength | null,
): HairOption[] {
  return items.filter((item) => {
    if (texture !== null && item.styleTexture !== texture) {
      return false;
    }
    if (length !== null && item.styleLength !== length) {
      return false;
    }
    return true;
  });
}

interface FilterMenuPillProps {
  label: string;
  emphasized: boolean;
  menuOpen: boolean;
  leftIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  accentColor: string;
  mutedColor: string;
  styles: ReturnType<typeof createStyles>;
}

function FilterMenuPill({
  label,
  emphasized,
  menuOpen,
  leftIcon,
  accentColor,
  mutedColor,
  styles,
}: FilterMenuPillProps) {
  const foreground = emphasized ? accentColor : mutedColor;
  const chevronName = menuOpen ? "chevron-up" : "chevron-down";

  return (
    <View
      style={[styles.pill, emphasized ? styles.pillEmphasized : styles.pillNeutral]}
      pointerEvents="box-none">
      <MaterialCommunityIcons name={leftIcon} size={18} color={foreground} />
      <Text style={[styles.pillLabel, emphasized ? styles.pillLabelAccent : styles.pillLabelMuted]}>
        {label}
      </Text>
      <MaterialCommunityIcons name={chevronName} size={18} color={foreground} />
    </View>
  );
}

export function HairStyleFilterBar({
  selectedTexture,
  selectedLength,
  onSelectTexture,
  onSelectLength,
}: HairStyleFilterBarProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);

  const { t } = useTranslation("main");

  const lengthMenuActions = useMemo(
    () => lengthActions(selectedLength, (key) => t(`hairFilters.length.${key}`)),
    [selectedLength, t],
  );
  const textureMenuActions = useMemo(
    () => textureActions(selectedTexture, (key) => t(`hairFilters.type.${key}`)),
    [selectedTexture, t],
  );

  const menuThemeVariant = colorScheme === "dark" ? "dark" : "light";

  const handleLengthPress = ({ nativeEvent }: NativeActionEvent) => {
    const id = nativeEvent.event;
    if (id === LENGTH_IDS.all) {
      onSelectLength(null);
    } else if (id === LENGTH_IDS.short) {
      onSelectLength("short");
    } else if (id === LENGTH_IDS.medium) {
      onSelectLength("medium");
    } else if (id === LENGTH_IDS.long) {
      onSelectLength("long");
    }
  };

  const handleTexturePress = ({ nativeEvent }: NativeActionEvent) => {
    const id = nativeEvent.event;
    if (id === TEXTURE_IDS.all) {
      onSelectTexture(null);
    } else if (id === TEXTURE_IDS.straight) {
      onSelectTexture("straight");
    } else if (id === TEXTURE_IDS.wavy) {
      onSelectTexture("wavy");
    } else if (id === TEXTURE_IDS.curly) {
      onSelectTexture("curly");
    }
  };

  const lengthEmphasized = selectedLength !== null || openMenu === "length";
  const typeEmphasized = selectedTexture !== null || openMenu === "type";

  return (
    <View style={styles.root}>
      <MenuView
        title={t("hairFilters.length.menuTitle")}
        actions={lengthMenuActions}
        shouldOpenOnLongPress={false}
        themeVariant={menuThemeVariant}
        onPressAction={handleLengthPress}
        onOpenMenu={() => {
          setOpenMenu("length");
        }}
        onCloseMenu={() => {
          setOpenMenu((prev) => (prev === "length" ? null : prev));
        }}
        style={styles.menuGrow}>
        <FilterMenuPill
          label={t("hairFilters.length.pillLabel")}
          emphasized={lengthEmphasized}
          menuOpen={openMenu === "length"}
          leftIcon="arrow-expand-vertical"
          accentColor={theme.colors.primary}
          mutedColor={theme.colors.text}
          styles={styles}
        />
      </MenuView>
      <MenuView
        title={t("hairFilters.type.menuTitle")}
        actions={textureMenuActions}
        shouldOpenOnLongPress={false}
        themeVariant={menuThemeVariant}
        onPressAction={handleTexturePress}
        onOpenMenu={() => {
          setOpenMenu("type");
        }}
        onCloseMenu={() => {
          setOpenMenu((prev) => (prev === "type" ? null : prev));
        }}
        style={styles.menuGrow}>
        <FilterMenuPill
          label={t("hairFilters.type.pillLabel")}
          emphasized={typeEmphasized}
          menuOpen={openMenu === "type"}
          leftIcon="weather-windy"
          accentColor={theme.colors.primary}
          mutedColor={theme.colors.text}
          styles={styles}
        />
      </MenuView>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    menuGrow: {
      flex: 1,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      backgroundColor: theme.colors.surface,
    },
    pillNeutral: {
      borderColor: "transparent",
    },
    pillEmphasized: {
      borderColor: theme.colors.primary,
    },
    pillLabel: {
      fontSize: 15,
      fontWeight: "700",
    },
    pillLabelMuted: {
      color: theme.colors.text,
    },
    pillLabelAccent: {
      color: theme.colors.primary,
    },
  });
}
