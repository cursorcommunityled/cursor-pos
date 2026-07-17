"use client";

import { useLocale } from "@/lib/i18n/locale-context";

interface QrGeneratorPreviewProps {
  previewUrl: string | null;
  url: string;
  isGenerating: boolean;
}

export function QrGeneratorPreview({ previewUrl, url, isGenerating }: QrGeneratorPreviewProps) {
  const { t } = useLocale();

  return (
    <div className="flex w-full flex-col items-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        {t.app.preview}
      </p>
      <div className="w-full max-w-[420px] rounded-3xl border border-zinc-200 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.12)] dark:border-zinc-800 dark:bg-zinc-900">
        {previewUrl ? (
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={t.qrGenerator.previewAlt}
              className="h-auto w-full max-w-[320px] rounded-xl bg-white"
            />
            {url.trim() ? (
              <p className="break-all text-center text-xs text-zinc-500 dark:text-zinc-400">
                {url.trim()}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-zinc-300 px-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {isGenerating ? t.qrGenerator.generating : t.qrGenerator.previewEmpty}
          </div>
        )}
      </div>
    </div>
  );
}
