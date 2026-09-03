import { isDevice } from "expo-device";
import { requireOptionalNativeModule } from "expo-modules-core";

interface DeviceCheckNativeModule {
  isSupported: boolean;
  generateTokenAsync(): Promise<string>;
}

export class DeviceCheckError extends Error {
  errorType: string;
  reason: string;

  constructor(errorType: string, reason = errorType) {
    super(errorType);
    this.name = "DeviceCheckError";
    this.errorType = errorType;
    this.reason = reason;
  }
}

export type DeviceCheckTokenResult =
  { data: string | null; error: null } | { data: null; error: DeviceCheckError };

const native = requireOptionalNativeModule<DeviceCheckNativeModule>("ExpoDeviceCheck");

export function isDeviceCheckSupported(): boolean {
  return process.env.EXPO_OS === "ios" && isDevice && native?.isSupported === true;
}

export async function generateDeviceCheckToken(): Promise<DeviceCheckTokenResult> {
  if (!isDeviceCheckSupported() || !native) {
    if (__DEV__) {
      return { data: null, error: null };
    }

    return { data: null, error: new DeviceCheckError("device_check_unavailable") };
  }

  try {
    const token = await native.generateTokenAsync();
    return { data: token, error: null };
  } catch {
    return { data: null, error: new DeviceCheckError("token_generation_failed") };
  }
}
