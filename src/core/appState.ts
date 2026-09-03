import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";

import i18n, { refreshSystemLanguage } from "@/integrations/i18n";

function onAppStateActive() {
  refreshSystemLanguage(i18n);
}

function onAppStateBackground() {}
function onAppStateInactive() {}
function onAppStateExtension() {}
function onAppStateUnknown() {}

export function handleAppStateChange(nextAppState: AppStateStatus) {
  switch (nextAppState) {
    case "active":
      onAppStateActive();
      break;
    case "background":
      onAppStateBackground();
      break;
    case "inactive":
      onAppStateInactive();
      break;
    case "extension":
      onAppStateExtension();
      break;
    case "unknown":
      onAppStateUnknown();
      break;
    default:
      break;
  }
}

export function useAppStateRuntime() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, []);
}
