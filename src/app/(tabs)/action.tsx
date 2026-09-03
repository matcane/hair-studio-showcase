import { CommonActions } from "@react-navigation/native";
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback } from "react";
import { Platform } from "react-native";

export default function Action() {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android") {
        return;
      }

      const state = navigation.getState();
      if (!state || state.type !== "tab") {
        return;
      }

      navigation.dispatch({
        ...CommonActions.goBack(),
        target: state.key,
      });
    }, [navigation]),
  );

  return null;
}
