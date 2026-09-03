import commonEn from "@/locales/common/en.json";
import commonPl from "@/locales/common/pl.json";
import mainEn from "@/locales/main/en.json";
import mainPl from "@/locales/main/pl.json";
import onboardingEn from "@/locales/onboarding/en.json";
import onboardingPl from "@/locales/onboarding/pl.json";

export const defaultNS = "common";

export const resources = {
  en: { common: commonEn, onboarding: onboardingEn, main: mainEn },
  pl: { common: commonPl, onboarding: onboardingPl, main: mainPl },
} as const;
