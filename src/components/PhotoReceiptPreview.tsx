"use client";

import Image from "next/image";

import { LOGO_SRC, getLogoPreviewSizeSmall } from "@/lib/logo-image";
import { getPhotoPreviewAspectClass, getPhotoPreviewMaxWidth } from "@/lib/photo-image";
import { getPreviewShellClass, type PhotoTicketData } from "@/lib/types";
import { formatTicketTimestamp } from "@/lib/timestamp";
import { useLocale } from "@/lib/i18n/locale-context";

interface PhotoReceiptPreviewProps {
  data: PhotoTicketData;
}

export function PhotoReceiptPreview({ data }: PhotoReceiptPreviewProps) {
  const { t } = useLocale();
  const shellClass = getPreviewShellClass(data.paperWidth);
  const logoSize = getLogoPreviewSizeSmall(data.paperWidth);
  const photoWidth = getPhotoPreviewMaxWidth(data.paperWidth);
  const photoFrameClass = getPhotoPreviewAspectClass();

  return (
    <div className="flex w-full flex-col items-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        {t.app.preview}
      </p>
      <div className={shellClass}>
        <div className="flex flex-col items-center text-center">
          {data.photoDataUrl ? (
            <div
              className={`mb-5 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 ${photoFrameClass}`}
              style={{ width: photoWidth }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.photoDataUrl}
                alt="Vista previa de la foto"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`mb-5 flex items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-500 ${photoFrameClass}`}
              style={{ width: photoWidth }}
            >
              {t.app.previewPhotoPlaceholder}
            </div>
          )}

          <p className="mb-1 text-base font-semibold">
            {data.nombre.trim() || t.app.namePlaceholder}
          </p>
          {data.extra.trim() ? (
            <p className="mb-1 text-sm text-zinc-700">{data.extra.trim()}</p>
          ) : null}
          {data.showTimestamp ? (
            <p className="mb-5 text-sm text-zinc-700">{formatTicketTimestamp()}</p>
          ) : null}

          <Image
            src={LOGO_SRC}
            alt="Logo Cursor"
            width={logoSize.width}
            height={logoSize.height}
            className="opacity-90"
            priority
          />
        </div>
      </div>
    </div>
  );
}
