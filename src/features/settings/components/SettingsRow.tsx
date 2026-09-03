import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MenuView, type MenuAction, type NativeActionEvent } from "@react-native-menu/menu";
import { Pressable, PressableProps, StyleSheet, Text, View, type ColorValue } from "react-native";

import { useTheme, type AppTheme } from "@/integrations/theme";

const Icon = MaterialCommunityIcons;

export type SettingsRowProps = PressableProps & {
  id?: string;
  title: string;
  iconLeft?: { name: keyof typeof MaterialCommunityIcons.glyphMap; color?: ColorValue };
  iconRight?: { name: keyof typeof MaterialCommunityIcons.glyphMap; color?: ColorValue };
  textRight?: string;
  roundedTop?: boolean;
  roundedBottom?: boolean;
  menu?: {
    actions: MenuAction[];
    onPressAction: (event: NativeActionEvent) => void;
  };
};

export function SettingsRow({
  title,
  iconLeft,
  textRight,
  iconRight,
  roundedTop,
  roundedBottom,
  menu,
  onPress,
  ...rest
}: SettingsRowProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const row = (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        roundedTop && styles.roundedTop,
        roundedBottom && styles.roundedBottom,
        pressed && styles.rowPressed,
      ]}
      onPress={menu ? undefined : onPress}
      {...rest}>
      <View style={styles.rowContainer}>
        <View style={styles.leftSide}>
          {iconLeft && (
            <Icon name={iconLeft.name} size={24} color={iconLeft.color ?? theme.colors.text} />
          )}
          <Text style={styles.rowText}>{title}</Text>
        </View>

        <View style={styles.rightSide}>
          {textRight && <Text style={styles.rowText}>{textRight}</Text>}
          {iconRight && (
            <Icon name={iconRight.name} size={24} color={iconRight.color ?? theme.colors.text} />
          )}
        </View>
      </View>
    </Pressable>
  );

  if (!menu) {
    return row;
  }

  return (
    <MenuView
      actions={menu.actions}
      shouldOpenOnLongPress={false}
      onPressAction={menu.onPressAction}
      style={styles.menuWrap}>
      {row}
    </MenuView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      height: 56,
      width: "100%",
      backgroundColor: theme.colors.surface,
    },
    roundedTop: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    roundedBottom: {
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    rowPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }],
    },
    rowContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 14,
      marginHorizontal: 16,
    },
    rowText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    leftSide: {
      gap: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    rightSide: {
      gap: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    menuWrap: {
      width: "100%",
    },
  });
