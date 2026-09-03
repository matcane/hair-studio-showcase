import * as Device from "expo-device";
import { Platform } from "react-native";

export const IS_IOS_SIMULATOR = Platform.OS === "ios" && !Device.isDevice;
