import {
  attestKeyAsync,
  generateAssertionAsync,
  generateKeyAsync,
  isSupported,
} from "@expo/app-integrity";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { randomUUID } from "expo-crypto";
import { isDevice } from "expo-device";
import { z } from "zod";

import { supabase } from "@/integrations/supabaseClient";
import { createMMKV } from "@/services/storage";

import { DeviceSessionError } from "./errors";

export { DeviceSessionError };

const nonceResponseSchema = z.object({ nonce: z.string().trim().min(1) });
const tokenResponseSchema = z.object({ token: z.string().trim().min(1) });
const errorResponseSchema = z.object({ error: z.string().trim().min(1) });

const DEVICE_SESSION_UNAVAILABLE_ERRORS = new Set([
  "nonce_unavailable",
  "jwt_not_configured",
  "apple_attest_not_configured",
]);

const DEVICE_JWT_TTL_MS = 10 * 60 * 1000;
const DEVICE_JWT_EXPIRY_SKEW_MS = 30_000;

const storage = createMMKV({ id: "deviceSession" });

let inFlightToken: Promise<string> | null = null;

export function isDeviceSessionUnavailableError(errorType: string) {
  return DEVICE_SESSION_UNAVAILABLE_ERRORS.has(errorType);
}

function isStoredDeviceAccessTokenFresh() {
  const expiresAt = storage.getNumber("jwtExpiresAt");
  return expiresAt != null && expiresAt > Date.now();
}

export async function getDeviceAccessToken(): Promise<string> {
  const token = storage.getString("jwt");
  if (token && isStoredDeviceAccessTokenFresh()) return token;

  invalidateDeviceAccessToken();
  return refreshDeviceAccessToken();
}

export function invalidateDeviceAccessToken() {
  storage.remove("jwt");
  storage.remove("jwtExpiresAt");
}

export function resetDeviceSession() {
  invalidateDeviceAccessToken();
  storage.remove("keyId");
}

export async function refreshDeviceAccessToken(): Promise<string> {
  inFlightToken ??= mintDeviceAccessToken().finally(() => {
    inFlightToken = null;
  });
  return inFlightToken;
}

async function mintDeviceAccessToken(): Promise<string> {
  const useNative = process.env.EXPO_OS === "ios" && isDevice && isSupported;
  if (!useNative && !__DEV__) {
    throw new DeviceSessionError("app_attest_unavailable");
  }

  const originalAppUserId = randomUUID();
  const storedKeyId = storage.getString("keyId");
  const action = storedKeyId ? "refresh" : "attest";
  const keyId = storedKeyId ?? (await createDeviceKeyId(useNative));
  const nonce =
    action === "attest"
      ? (await postDeviceSession({ action: "nonce" }, nonceResponseSchema)).nonce
      : undefined;
  const blob = useNative ? await createAttestBlob(action, keyId, nonce ?? keyId) : undefined;

  const { token } = await postDeviceSession(
    {
      action,
      platform: process.env.EXPO_OS === "android" ? "android" : "ios",
      nonce,
      key_id: keyId,
      rc_app_user_id: originalAppUserId,
      blob,
    },
    tokenResponseSchema,
  );

  storage.set("keyId", keyId);
  storage.set("jwt", token);
  storage.set("jwtExpiresAt", Date.now() + DEVICE_JWT_TTL_MS - DEVICE_JWT_EXPIRY_SKEW_MS);
  return token;
}

async function createDeviceKeyId(useNative: boolean) {
  if (!useNative) return randomUUID();

  try {
    return await generateKeyAsync();
  } catch {
    throw new DeviceSessionError("key_generation_failed");
  }
}

async function createAttestBlob(action: "attest" | "refresh", keyId: string, challenge: string) {
  try {
    return action === "attest"
      ? await attestKeyAsync(keyId, challenge)
      : await generateAssertionAsync(keyId, challenge);
  } catch {
    throw new DeviceSessionError(action === "attest" ? "attest_failed" : "assertion_failed");
  }
}

async function postDeviceSession<T>(body: object, schema: z.ZodType<T>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("device-session", { body });

  if (error instanceof FunctionsHttpError) {
    const parsed = errorResponseSchema.safeParse(await error.context.json().catch(() => null));
    const errorType = parsed.success ? parsed.data.error : "http_error";

    if (errorType === "unknown_device_key") {
      resetDeviceSession();
    }

    throw new DeviceSessionError(errorType);
  }

  if (error) {
    throw new DeviceSessionError("NETWORK_ERROR", "network");
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new DeviceSessionError("invalid_response");
  }

  return parsed.data;
}
