"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { en } from "./en";
import { ru } from "./ru";
import { de } from "./de";
import type { Translations } from "./en";

export type Language = "ru" | "en" | "de";

const translations: Record<Language, Translations> = { ru, en, de };

const STORAGE_KEY = "hiking-lang";

interface LangContextValue {
  lang: Language;
  t: Translations;
  setLang: (l: Language) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  t: en,
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && translations[saved]) setLangState(saved);
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}
