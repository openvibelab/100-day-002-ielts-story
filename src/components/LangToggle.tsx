"use client";

import { useLang } from "@/lib/LangContext";

export function LangToggle() {
  const { locale, setLocale } = useLang();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
      className="rounded-lg border border-dark-border px-2.5 py-1.5 text-xs font-medium text-warm-secondary transition-colors hover:border-gray-500 hover:text-warm-text"
      aria-label={locale === "en" ? "切换到中文" : "Switch to English"}
      title={locale === "en" ? "切换到中文" : "Switch to English"}
    >
      {locale === "en" ? "中文" : "EN"}
    </button>
  );
}
