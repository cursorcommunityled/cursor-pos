"use client";

import { useLocale } from "@/lib/i18n/locale-context";
import { useTheme } from "@/lib/theme/theme-context";
import type { Theme } from "@/lib/theme/types";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <span className="sr-only">{t.theme.label}</span>
      {(["light", "dark"] as Theme[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setTheme(option)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            theme === option
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          }`}
        >
          {t.theme[option]}
        </button>
      ))}
    </div>
  );
}
