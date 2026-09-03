import { DeviceSessionError } from "@/integrations/deviceSession/errors";

const RETRYABLE_GENERATION_ERRORS = new Set([
  "invalid_token",
  "unknown_device_key",
  "device_check_invalid",
]);

export class GenerationError extends Error {
  errorType: string;
  reason: string;

  constructor(errorType: string, reason: string) {
    super(`[${errorType}]: ${reason}`);
    this.name = "GenerationError";
    this.errorType = errorType;
    this.reason = reason;
  }
}

export function shouldRetryHairGeneration(failureCount: number, error: Error) {
  if (failureCount >= 1) return false;

  if (error instanceof GenerationError || error instanceof DeviceSessionError) {
    return RETRYABLE_GENERATION_ERRORS.has(error.errorType);
  }

  return false;
}
