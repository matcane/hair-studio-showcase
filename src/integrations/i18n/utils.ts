import * as Localization from "expo-localization";
import type { i18n, LanguageDetectorModule } from "i18next";

import { globalStorage } from "@/services/storage";

export const LANGUAGE_KEY = "user.language";

export const getDeviceLanguage = (): string => {
  return Localization.getLocales()[0]?.languageCode ?? "en";
};

export const languageDetector: LanguageDetectorModule = {
  type: "languageDetector",
  detect: (): string => {
    const savedLanguage = globalStorage.getString(LANGUAGE_KEY);

    if (savedLanguage && savedLanguage !== "system") {
      return savedLanguage;
    }

    return getDeviceLanguage();
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

export function refreshSystemLanguage(i18nInstance: i18n) {
  const savedPreference = globalStorage.getString(LANGUAGE_KEY);

  if (savedPreference && savedPreference !== "system") return;

  const newDeviceLang = getDeviceLanguage();

  if (i18nInstance.resolvedLanguage !== newDeviceLang) {
    i18nInstance.changeLanguage(newDeviceLang);
  }
}

export type TLanguages = "en" | "pl" | "system";

export const setAppLanguage = (i18nInstance: i18n, choice: TLanguages) => {
  if (choice === "system") {
    globalStorage.set(LANGUAGE_KEY, "system");

    const deviceLang = Localization.getLocales()[0]?.languageCode ?? "en";
    i18nInstance.changeLanguage(deviceLang);
  } else {
    globalStorage.set(LANGUAGE_KEY, choice);
    i18nInstance.changeLanguage(choice);
  }
};
