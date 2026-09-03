import * as Sentry from "@sentry/react-native";

interface LogContext {
  [key: string]: unknown;
}

const isDev = __DEV__;

export const Logger = {
  debug(message: string, context?: LogContext) {
    const payload = context ? { message, context } : message;

    if (isDev) console.debug(payload);
  },

  info(message: string, context?: LogContext) {
    const payload = context ? { message, context } : message;

    if (isDev) console.info(payload);
  },

  warn(message: string, context?: LogContext) {
    const payload = context ? { message, context } : message;

    if (isDev) console.warn(payload);
  },

  error(error: Error | string, context?: LogContext) {
    const isError = error instanceof Error;

    const message = isError ? error.message : error;
    const payload = isError ? { message: message, error, context } : { message: error, context };

    if (isDev) {
      console.error(payload);
      return;
    }

    if (isError) {
      Sentry.captureException(error, { extra: context });
    } else {
      Sentry.captureMessage(message, { level: "error", extra: context });
    }
  },
};
