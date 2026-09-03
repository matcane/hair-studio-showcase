import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CloseToolbarProps {
  onPress: () => void;
}

export function CloseToolbar({ onPress }: CloseToolbarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable style={[styles.close, { top: insets.top }]} onPress={onPress}>
      <MaterialCommunityIcons name="close" size={28} color="#FFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  close: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});
