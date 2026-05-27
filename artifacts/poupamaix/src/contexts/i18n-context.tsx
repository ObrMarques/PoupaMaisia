import { createContext, useContext, useState, useCallback } from "react";
import { translations, Language, LANGUAGE_LABELS, LANGUAGE_LOCALES } from "@/i18n/translations";

interface I18nContextType {
  language: Language;
  locale: string;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: typeof LANGUAGE_LABELS;
  isRTL: boolean;
}

const RTL_LANGUAGES: Language[] = [];

const I18nContext = createContext<I18nContextType>({
  language: "pt-BR",
  locale: "pt-BR",
  setLanguage: () => {},
  t: (key) => key,
  languages: LANGUAGE_LABELS,
  isRTL: false,
});

function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language;
    return saved && saved in translations ? saved : "pt-BR";
  });

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem("language", lang);
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    const langTranslations = translations[language];
    const value = getNestedValue(langTranslations, key);
    if (value !== undefined) return value;
    const fallback = getNestedValue(translations["pt-BR"], key);
    return fallback ?? key;
  }, [language]);

  const isRTL = RTL_LANGUAGES.includes(language);
  const locale = LANGUAGE_LOCALES[language];

  return (
    <I18nContext.Provider value={{ language, locale, setLanguage, t, languages: LANGUAGE_LABELS, isRTL }}>
      <div dir={isRTL ? "rtl" : "ltr"}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
