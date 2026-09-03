import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

interface LookResultToolbarProps {
  isComparing: boolean;
  handleCompare: () => void;
  handleDownload: () => void;
  handleShareLook: () => void;
  handleOpenDetails: () => void;
  handleDelete: () => void;
}

export function LookResultToolbar({
  isComparing,
  handleCompare,
  handleDownload,
  handleShareLook,
  handleOpenDetails,
  handleDelete,
}: LookResultToolbarProps) {
  return (
    <Animated.View entering={FadeIn.duration(350)} style={styles.bottomBar}>
      <Pressable onPress={handleCompare} style={[styles.iconSlot, styles.iconSlotSolo]}>
        <MaterialCommunityIcons
          name={isComparing ? "compare-remove" : "compare"}
          size={28}
          color="#FFF"
        />
      </Pressable>
      <View style={styles.iconCenterSlot}>
        <Pressable onPress={handleDownload} style={styles.iconSlot}>
          <MaterialCommunityIcons name="content-save" size={28} color="#FFF" />
        </Pressable>
        <View style={styles.divider} />
        <Pressable onPress={handleShareLook} style={styles.iconSlot}>
          <MaterialCommunityIcons name="share-variant" size={28} color="#FFF" />
        </Pressable>
        <View style={styles.divider} />
        <Pressable onPress={handleOpenDetails} style={styles.iconSlot}>
          <MaterialCommunityIcons name="information" size={28} color="#FFF" />
        </Pressable>
      </View>
      <Pressable onPress={handleDelete} style={[styles.iconSlot, styles.iconSlotSolo]}>
        <MaterialCommunityIcons name="delete-outline" size={28} color="#FFF" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingTop: 20,
    paddingHorizontal: 24,
    bottom: 24,
  },
  iconCenterSlot: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 24,
    paddingHorizontal: 8,
  },
  iconSlot: {
    minWidth: 52,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    opacity: 1,
    borderRadius: 26,
  },
  iconSlotSolo: {
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  divider: {
    width: 1,
    backgroundColor: "gray",
  },
});
