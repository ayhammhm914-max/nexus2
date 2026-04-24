import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translate, type Language, type TranslationKey } from "../i18n/translations";

type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set({ language: get().language === "en" ? "ar" : "en" })
    }),
    {
      name: "nexus-language"
    }
  )
);

export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language);

  return {
    language,
    isArabic: language === "ar",
    dir: language === "ar" ? "rtl" : "ltr",
    t: (key: TranslationKey) => translate(language, key)
  };
};
