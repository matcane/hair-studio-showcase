export class DeviceSessionError extends Error {
  errorType: string;
  reason: string;

  constructor(errorType: string, reason = errorType) {
    super(errorType);
    this.name = "DeviceSessionError";
    this.errorType = errorType;
    this.reason = reason;
  }
}
