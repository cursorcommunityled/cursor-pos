"use client";

import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/types";

export function LanguageSwitch() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
      <span className="sr-only">{t.language.label}</span>
      {(["es", "en"] as Locale[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            locale === option
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          }`}
        >
          {t.language[option]}
        </button>
      ))}
    </div>
  );
}
