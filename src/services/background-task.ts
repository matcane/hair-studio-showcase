import { AppState, type AppStateStatus, Platform } from "react-native";
import BackgroundService from "react-native-background-actions";

import { Logger } from "@/services/logger";

// iOS decides how much extra time to grant after backgrounding (often ~30s, not guaranteed).
// This is only our polling cap — if the OS grants less, `expiration` fires first.
const IOS_MAX_KEEP_ALIVE_MS = 50_000;
const POLL_INTERVAL_MS = 500;

export interface IosBackgroundTaskOptions {
  taskName: string;
  taskTitle: string;
  taskDesc: string;
}

function isAppInBackground(state: AppStateStatus): boolean {
  return state === "background" || state === "inactive";
}

async function waitUntilDone(isDone: () => boolean): Promise<void> {
  const startedAt = Date.now();
  while (!isDone() && Date.now() - startedAt < IOS_MAX_KEEP_ALIVE_MS) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

async function startKeepAlive(
  options: IosBackgroundTaskOptions,
  isDone: () => boolean,
): Promise<void> {
  try {
    BackgroundService.once("expiration", () => {
      Logger.error(new Error("iOS background keep-alive expired before task finished"), {
        taskName: options.taskName,
      });
    });

    await BackgroundService.start(() => waitUntilDone(isDone), {
      taskName: options.taskName,
      taskTitle: options.taskTitle,
      taskDesc: options.taskDesc,
      taskIcon: { name: "ic_launcher", type: "mipmap" },
    });
  } catch (err) {
    const caught = err instanceof Error ? err : new Error(String(err));
    Logger.error(caught, { message: "iOS background keep-alive failed to start" });
  }
}

async function stopKeepAlive(): Promise<void> {
  try {
    if (BackgroundService.isRunning()) {
      await BackgroundService.stop();
    }
  } catch (err) {
    const caught = err instanceof Error ? err : new Error(String(err));
    Logger.error(caught, { message: "iOS background keep-alive failed to stop" });
  }
}

/**
 * Runs `work` and, on iOS only, starts a background keep-alive if the app is
 * backgrounded while work is still pending (`beginBackgroundTask`).
 *
 * Does nothing special on other platforms. Force-quit still kills the process immediately.
 */
export async function runWithIosBackgroundTask<T>(
  work: () => Promise<T>,
  options: IosBackgroundTaskOptions,
): Promise<T> {
  if (Platform.OS !== "ios") {
    return work();
  }

  let isWorkDone = false;
  let keepAliveActive = false;

  const handleAppStateChange = (nextState: AppStateStatus) => {
    if (isWorkDone) {
      return;
    }

    if (!isAppInBackground(nextState)) {
      if (keepAliveActive) {
        keepAliveActive = false;
        stopKeepAlive();
      }
      return;
    }

    if (!keepAliveActive && !BackgroundService.isRunning()) {
      keepAliveActive = true;
      startKeepAlive(options, () => isWorkDone);
    }
  };

  const subscription = AppState.addEventListener("change", handleAppStateChange);

  if (isAppInBackground(AppState.currentState)) {
    handleAppStateChange(AppState.currentState);
  }

  try {
    return await work();
  } finally {
    isWorkDone = true;
    subscription.remove();
    if (keepAliveActive) {
      keepAliveActive = false;
      await stopKeepAlive();
    }
  }
}
