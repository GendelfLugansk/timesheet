import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en";
import ru from "../locales/ru";

import LanguageDetector from "i18next-browser-languagedetector";

const supportedLocales = ["en", "ru"];

const localesInfo = {
  en: {
    flag: "us",
    name: "English"
  },
  ru: {
    flag: "ru",
    name: "Русский"
  }
};

const getLocaleInfo = locale =>
  typeof localesInfo[locale] === "object"
    ? localesInfo[locale]
    : { flag: "un", name: "> . <" };

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      ru
    },
    defaultNS: "common",
    fallbackNS: "common",
    whitelist: supportedLocales,
    fallbackLng: "en",
    debug: false,

    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: false
    }
  });

export { supportedLocales, getLocaleInfo };
export default i18n;
