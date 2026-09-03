import { FunctionsHttpError } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";
import { desc, eq, or } from "drizzle-orm";
import { Directory, File, Paths } from "expo-file-system";
import { z } from "zod";

import {
  getDeviceAccessToken,
  invalidateDeviceAccessToken,
  resetDeviceSession,
} from "@/integrations/deviceSession";
import { sqliteDb } from "@/integrations/sqlite";
import { supabase } from "@/integrations/supabaseClient";
import type { HairOptionType } from "@/shared/types";
import { hairGenerations, type LookRow } from "@/sqlite/schema";

import { GenerationError, shouldRetryHairGeneration } from "./generation-retry";

export { GenerationError, shouldRetryHairGeneration };

const generationSuccessSchema = z.object({
  base_64: z.string().trim().min(1),
});

const generationErrorSchema = z.object({
  error: z.string().trim().min(1),
  reason: z.string().optional(),
  message: z.string().optional(),
});

export interface GenerationRequestParams {
  action_type: HairOptionType;
  action_id: string;
  user_image_b64: string;
  device_check_token?: string;
  device_check_update_token?: string;
}

export type GenerationSuccessResponse = z.infer<typeof generationSuccessSchema>;

export async function generateHairImage(requestParams: GenerationRequestParams) {
  const { data, error } = await supabase.functions.invoke("generate-image", {
    headers: {
      Authorization: `Bearer ${await getDeviceAccessToken()}`,
    },
    body: { data: requestParams },
  });

  if (error instanceof FunctionsHttpError) {
    const parsed = generationErrorSchema.safeParse(await error.context.json().catch(() => null));
    const errorType = parsed.success ? parsed.data.error : "NETWORK_ERROR";
    const reason = parsed.success
      ? (parsed.data.reason ?? parsed.data.message ?? parsed.data.error)
      : "network";

    if (errorType === "invalid_token") {
      invalidateDeviceAccessToken();
    } else if (errorType === "unknown_device_key") {
      resetDeviceSession();
    }

    throw new GenerationError(errorType, reason);
  }

  if (error) {
    throw new GenerationError("NETWORK_ERROR", "network");
  }

  const parsed = generationSuccessSchema.safeParse(data);
  if (!parsed.success) {
    throw new GenerationError("INVALID_RESPONSE", "invalid_response");
  }

  return parsed.data;
}

export function getLooksOptions() {
  return queryOptions({
    queryKey: ["looks"],
    queryFn: async () =>
      await sqliteDb
        .select()
        .from(hairGenerations)
        .where(or(eq(hairGenerations.status, "ready"), eq(hairGenerations.status, "pending")))
        .orderBy(desc(hairGenerations.createdAt)),
  });
}

export async function deleteLook(uuid: string) {
  await sqliteDb.delete(hairGenerations).where(eq(hairGenerations.uuid, uuid));
  lookDirectory(uuid).delete();
}

export function lookDirectory(uuid: string) {
  return new Directory(Paths.document, "Looks", uuid);
}

export function lookImageUri(uuid: string, filename: string) {
  return new File(Paths.document, "Looks", uuid, filename).uri;
}

export function lookUrisFromRow(row: LookRow) {
  const afterFilename = row.afterFilename ?? row.beforeFilename;
  return {
    beforeUri: lookImageUri(row.uuid, row.beforeFilename),
    afterUri: lookImageUri(row.uuid, afterFilename),
  };
}
