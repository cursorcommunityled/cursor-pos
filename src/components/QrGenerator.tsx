"use client";

import { Download, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  buildBrandedQrCanvas,
  canvasToPngDataUrl,
  downloadBrandedQr,
  QR_GENERATOR_SIZES,
  slugifyFilename,
  type QrGeneratorSize,
} from "@/lib/branded-qr";
import { useLocale } from "@/lib/i18n/locale-context";

interface QrGeneratorProps {
  onPreviewChange: (data: {
    previewUrl: string | null;
    url: string;
    isGenerating: boolean;
  }) => void;
  onStatus: (message: string | null) => void;
}

export function QrGenerator({ onPreviewChange, onStatus }: QrGeneratorProps) {
  const { t } = useLocale();
  const [url, setUrl] = useState("");
  const [size, setSize] = useState<QrGeneratorSize>(1024);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setPreviewCanvas(null);
      onPreviewChange({ previewUrl: null, url: "", isGenerating: false });
      return;
    }

    let cancelled = false;
    setIsGenerating(true);
    onPreviewChange({ previewUrl: null, url: trimmed, isGenerating: true });

    const timer = window.setTimeout(() => {
      void buildBrandedQrCanvas(trimmed, 512)
        .then((canvas) => {
          if (cancelled) {
            return;
          }

          setPreviewCanvas(canvas);
          onPreviewChange({
            previewUrl: canvasToPngDataUrl(canvas),
            url: trimmed,
            isGenerating: false,
          });
        })
        .catch((error) => {
          if (cancelled) {
            return;
          }

          setPreviewCanvas(null);
          onPreviewChange({ previewUrl: null, url: trimmed, isGenerating: false });
          onStatus(error instanceof Error ? error.message : t.qrGenerator.generateError);
        })
        .finally(() => {
          if (!cancelled) {
            setIsGenerating(false);
          }
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [url, onPreviewChange, onStatus, t.qrGenerator.generateError]);

  async function handleDownload() {
    const trimmed = url.trim();
    if (!trimmed) {
      onStatus(t.qrGenerator.urlRequired);
      return;
    }

    setIsDownloading(true);
    onStatus(null);

    try {
      const canvas = previewCanvas && size === 512 ? previewCanvas : await buildBrandedQrCanvas(trimmed, size);
      downloadBrandedQr(canvas, `${slugifyFilename(trimmed)}-${size}.png`);
      onStatus(t.qrGenerator.downloaded);
    } catch (error) {
      onStatus(error instanceof Error ? error.message : t.qrGenerator.downloadError);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t.qrGenerator.title}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.qrGenerator.subtitle}</p>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.qrGenerator.urlLabel}
          </span>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={t.qrGenerator.urlPlaceholder}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.qrGenerator.sizeLabel}
          </span>
          <select
            value={size}
            onChange={(event) => setSize(Number(event.target.value) as QrGeneratorSize)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {QR_GENERATOR_SIZES.map((option) => (
              <option key={option} value={option}>
                {option} x {option} px
              </option>
            ))}
          </select>
        </label>

        <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{t.qrGenerator.hint}</p>
      </div>

      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={!url.trim() || isGenerating || isDownloading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDownloading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {t.qrGenerator.download}
      </button>
    </div>
  );
}
