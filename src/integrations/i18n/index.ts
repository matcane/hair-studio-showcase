/* eslint-disable import/no-named-as-default-member */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { defaultNS, resources } from "./resources";
import { languageDetector } from "./utils";

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export { LANGUAGE_KEY, refreshSystemLanguage, setAppLanguage, type TLanguages } from "./utils";
export default i18n;
