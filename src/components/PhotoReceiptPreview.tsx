"use client";

import Image from "next/image";

import { LOGO_SRC, getLogoPreviewSizeSmall } from "@/lib/logo-image";
import { getPhotoPreviewMaxWidth } from "@/lib/photo-image";
import { getPreviewShellClass, type PhotoTicketData } from "@/lib/types";
import { formatTicketTimestamp } from "@/lib/timestamp";

interface PhotoReceiptPreviewProps {
  data: PhotoTicketData;
}

export function PhotoReceiptPreview({ data }: PhotoReceiptPreviewProps) {
  const shellClass = getPreviewShellClass(data.paperWidth);
  const logoSize = getLogoPreviewSizeSmall(data.paperWidth);
  const photoWidth = getPhotoPreviewMaxWidth(data.paperWidth);

  return (
    <div className="flex w-full flex-col items-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
        Vista previa
      </p>
      <div className={shellClass}>
        <div className="flex flex-col items-center text-center">
          {data.photoDataUrl ? (
            <div
              className="mb-5 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100"
              style={{ width: photoWidth }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.photoDataUrl}
                alt="Vista previa de la foto"
                className="w-full object-cover"
              />
            </div>
          ) : (
            <div
              className="mb-5 flex aspect-[3/4] items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-500"
              style={{ width: photoWidth }}
            >
              La foto aparecera aqui
            </div>
          )}

          <p className="mb-1 text-base font-semibold">
            {data.nombre.trim() || "Nombre"}
          </p>
          <p className="mb-5 text-sm text-zinc-700">{formatTicketTimestamp()}</p>

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
