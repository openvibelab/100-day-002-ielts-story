"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, getLocale, setLocale as persistLocale } from "./i18n";

interface LangContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LangContext = createContext<LangContextValue>({
  locale: "en",
  setLocale: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(getLocale());
  }, []);

  function setLocale(l: Locale) {
    persistLocale(l);
    setLocaleState(l);
  }

  return (
    <LangContext.Provider value={{ locale, setLocale }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
