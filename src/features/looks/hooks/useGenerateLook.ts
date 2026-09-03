import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { randomUUID } from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import { Alert } from "react-native";

import { generateDeviceCheckToken, isDeviceCheckSupported } from "@/integrations/deviceCheck";
import { DeviceSessionError, isDeviceSessionUnavailableError } from "@/integrations/deviceSession";
import i18n from "@/integrations/i18n";
import { sqliteDb } from "@/integrations/sqlite";
import { Analytics } from "@/services/analytics";
import { runWithIosBackgroundTask } from "@/services/background-task";
import { Logger } from "@/services/logger";
import type { HairStyleLength, HairStyleTexture } from "@/shared/types";
import { hairGenerations } from "@/sqlite/schema";

import {
  GenerationError,
  generateHairImage,
  getLooksOptions,
  shouldRetryHairGeneration,
  type GenerationRequestParams,
} from "../api";
import { markUnseenReadyLook } from "../store";
import type { LookMeta } from "../types";

export interface GenerateLookVariables {
  requestParams: GenerationRequestParams;
  draftSource: string;
  title: string;
  styleLength?: HairStyleLength;
  styleTexture?: HairStyleTexture;
}

const GENERATION_BACKGROUND_TASK = {
  taskName: "HairGeneration",
  taskTitle: "Generating look",
  taskDesc: "Creating your hairstyle preview",
};

const DEVICE_CHECK_ERROR_TYPES = new Set<string>([
  "device_check_unavailable",
  "device_check_invalid",
  "token_generation_failed",
  "missing_device_check_token",
]);

async function requireDeviceCheckToken() {
  const { data, error } = await generateDeviceCheckToken();
  if (error) {
    throw new GenerationError(error.errorType, error.reason);
  }
  if (!data) {
    throw new GenerationError("missing_device_check_token", "token_generation_failed");
  }
  return data;
}

async function generateHairImageWithDeviceCheck(requestParams: GenerationRequestParams) {
  if (!isDeviceCheckSupported()) {
    return generateHairImage(requestParams);
  }

  const device_check_token = await requireDeviceCheckToken();
  const device_check_update_token = await requireDeviceCheckToken();

  return generateHairImage({
    ...requestParams,
    device_check_token,
    device_check_update_token,
  });
}

export function useGenerateLook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["generation"],
    mutationFn: ({ requestParams }: GenerateLookVariables) =>
      runWithIosBackgroundTask(
        () => generateHairImageWithDeviceCheck(requestParams),
        GENERATION_BACKGROUND_TASK,
      ),
    retry: shouldRetryHairGeneration,
    retryDelay: 0,

    onMutate: async ({ requestParams, draftSource, title, styleLength, styleTexture }) => {
      Analytics.track("generate_started", {
        is_free_generation: true,
      });

      const uuid = randomUUID();
      const createdAt = Date.now();

      const looksDir = new Directory(Paths.document, "Looks", uuid);
      looksDir.create({ intermediates: true, idempotent: true });

      const beforeExtension = draftSource.split(".").at(-1);
      const beforeFilename = `before.${beforeExtension ?? "png"}`;
      const beforeFile = new File(looksDir, beforeFilename);
      beforeFile.write(requestParams.user_image_b64, { encoding: "base64" });

      const meta: LookMeta = {
        uuid,
        createdAt,
        actionType: requestParams.action_type,
        actionId: requestParams.action_id,
        actionTitle: requestParams.action_type === "celebrity_hair_change" ? title : undefined,
        styleLength: styleLength,
        styleTexture: styleTexture,
      };

      await sqliteDb.insert(hairGenerations).values({
        ...meta,
        status: "pending",
        beforeFilename,
      });

      await queryClient.invalidateQueries({ queryKey: getLooksOptions().queryKey });

      return { meta };
    },

    onSuccess: async (data, _variables, context) => {
      const looksDir = new Directory(Paths.document, "Looks", context.meta.uuid);
      looksDir.create({ intermediates: true, idempotent: true });

      const afterFilename = "after.png";
      const afterFile = new File(looksDir, `after.png`);
      afterFile.write(data.base_64, { encoding: "base64" });

      await sqliteDb
        .update(hairGenerations)
        .set({ status: "ready", afterFilename })
        .where(eq(hairGenerations.uuid, context.meta.uuid));

      markUnseenReadyLook();
      await queryClient.invalidateQueries({ queryKey: getLooksOptions().queryKey });
    },

    onError: async (error: GenerationError | DeviceSessionError, _variables, context) => {
      if (context?.meta.uuid) {
        await sqliteDb
          .update(hairGenerations)
          .set({ status: "failed" })
          .where(eq(hairGenerations.uuid, context.meta.uuid));

        await queryClient.invalidateQueries({ queryKey: getLooksOptions().queryKey });
      }

      Logger.error(error, {
        message: "Look generation failed",
        errorType: error.errorType,
        reason: error.reason,
      });

      const title = i18n.t("main:gallery.generation.failed.title");

      if (error.errorType === "NETWORK_ERROR") {
        Alert.alert(title, i18n.t("main:gallery.generation.failed.network"));
        return;
      }

      if (DEVICE_CHECK_ERROR_TYPES.has(error.errorType)) {
        Alert.alert(title, i18n.t("main:gallery.generation.failed.deviceCheck"));
        return;
      }

      if (
        error.errorType === "app_attest_unavailable" ||
        isDeviceSessionUnavailableError(error.errorType)
      ) {
        Alert.alert(title, i18n.t("main:gallery.generation.failed.appAttest"));
        return;
      }

      Alert.alert(title, i18n.t("main:gallery.generation.failed.generic"));
    },
  });
}
