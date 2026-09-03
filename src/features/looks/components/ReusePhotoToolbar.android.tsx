import { MenuView, type MenuAction, type NativeActionEvent } from "@react-native-menu/menu";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

const REUSE_BEFORE = "before";
const REUSE_AFTER = "after";

interface ReusePhotoToolbarProps {
  beforeUri: string;
  afterUri: string;
  onReuse: (uri: string) => void;
}

export function ReusePhotoToolbar({ beforeUri, afterUri, onReuse }: ReusePhotoToolbarProps) {
  const { t } = useTranslation("main");
  const insets = useSafeAreaInsets();
  const styles = createStyles(insets);
  const canReuseAfter = Boolean(afterUri) && afterUri !== beforeUri;

  const actions = useMemo<MenuAction[]>(
    () => [
      {
        id: REUSE_BEFORE,
        title: t("gallery.reuse.before"),
      },
      {
        id: REUSE_AFTER,
        title: t("gallery.reuse.after"),
        attributes: { disabled: !canReuseAfter },
      },
    ],
    [canReuseAfter, t],
  );

  const handlePressAction = ({ nativeEvent }: NativeActionEvent) => {
    if (nativeEvent.event === REUSE_BEFORE) {
      onReuse(beforeUri);
      return;
    }

    if (nativeEvent.event === REUSE_AFTER && canReuseAfter) {
      onReuse(afterUri);
    }
  };

  return (
    <MenuView
      actions={actions}
      shouldOpenOnLongPress={false}
      isAnchoredToRight
      onPressAction={handlePressAction}
      style={styles.menu}>
      <View style={styles.button}>
        <Text style={styles.label}>{t("gallery.reuse.button")}</Text>
      </View>
    </MenuView>
  );
}

const createStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    menu: {
      position: "absolute",
      top: insets.top,
      right: 16,
    },
    button: {
      minHeight: 44,
      paddingHorizontal: 14,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.35)",
    },
    label: {
      fontSize: 15,
      fontWeight: "600",
      color: "#FFF",
    },
  });
