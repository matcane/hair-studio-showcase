import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { createMMKV, createMMKVStorage } from "@/services/storage";

import type { Database } from "./types";

const localSupabaseUrl = Platform.select({
  ios: process.env.EXPO_PUBLIC_SUPABASE_URL_IOS,
  android: Device.isDevice
    ? process.env.EXPO_PUBLIC_SUPABASE_URL_ANDROID_DEVICE
    : process.env.EXPO_PUBLIC_SUPABASE_URL_ANDROID,
});

const supabaseUrl = __DEV__ ? localSupabaseUrl! : process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

const sessionStorage = createMMKV({ id: "sessionStorage" });
const supabaseAuthStorage = createMMKVStorage(sessionStorage);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
