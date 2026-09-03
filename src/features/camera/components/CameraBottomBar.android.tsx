import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

interface CameraBottomBarProps {
  canCapture: boolean;
  handleCapture: () => void;
  handleGallery: () => void;
  handleCameraFlip: () => void;
}

export function CameraBottomBar({
  canCapture,
  handleCapture,
  handleGallery,
  handleCameraFlip,
}: CameraBottomBarProps) {
  const insets = useSafeAreaInsets();
  const styles = createStyles(insets);

  return (
    <View style={styles.controls}>
      <Pressable onPress={handleGallery} style={styles.sideButton}>
        <MaterialCommunityIcons name="image" size={28} color="#fff" />
      </Pressable>

      <Pressable
        onPress={handleCapture}
        disabled={!canCapture}
        style={[styles.shutterOuter, !canCapture && styles.shutterOuterDisabled]}>
        <View style={[styles.shutterInner, !canCapture && styles.shutterInnerDisabled]} />
      </Pressable>

      <Pressable onPress={handleCameraFlip} style={styles.sideButton}>
        <MaterialCommunityIcons name="camera-flip" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const createStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    controls: {
      width: "100%",
      position: "absolute",
      bottom: insets.bottom + 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingHorizontal: 24,
    },
    sideButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.35)",
    },

    shutterOuter: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 4,
      borderColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
    shutterOuterDisabled: {
      borderColor: "rgba(255,255,255,0.35)",
    },
    shutterInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#fff",
    },
    shutterInnerDisabled: {
      backgroundColor: "rgba(255,255,255,0.35)",
    },
  });
