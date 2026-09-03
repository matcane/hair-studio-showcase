import { memo } from "react";
import { StyleSheet, View } from "react-native";

export const HairCelebImageBottomSoften = memo(function HairCelebImageBottomSoften() {
  return <View pointerEvents="none" style={styles.root} />;
});

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
    experimental_backgroundImage:
      "linear-gradient(to top, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
  },
});
