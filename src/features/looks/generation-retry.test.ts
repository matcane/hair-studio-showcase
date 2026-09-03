import { DeviceSessionError } from "@/integrations/deviceSession/errors";

import { GenerationError, shouldRetryHairGeneration } from "./generation-retry";

describe("shouldRetryHairGeneration", () => {
  it("does not retry after the first failure, even for a retryable error", () => {
    expect(
      shouldRetryHairGeneration(1, new GenerationError("invalid_token", "invalid_token")),
    ).toBe(false);
  });

  it("retries a generation error with a retryable type on the first failure", () => {
    expect(
      shouldRetryHairGeneration(0, new GenerationError("unknown_device_key", "unknown_device_key")),
    ).toBe(true);
  });

  it("retries a session error with a retryable type on the first failure", () => {
    expect(shouldRetryHairGeneration(0, new DeviceSessionError("invalid_token"))).toBe(true);
  });

  it("does not retry a typed error whose type is not retryable", () => {
    expect(shouldRetryHairGeneration(0, new GenerationError("NETWORK_ERROR", "network"))).toBe(
      false,
    );
  });

  it("does not retry a plain Error", () => {
    expect(shouldRetryHairGeneration(0, new Error("NETWORK_ERROR"))).toBe(false);
  });
});
