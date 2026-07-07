"use client";

import Image from "next/image";
import QRCode from "react-qr-code";

import { useLocale } from "@/lib/i18n/locale-context";
import { LOGO_SRC, getLogoPreviewSize } from "@/lib/logo-image";
import type { LumaReceiptData } from "@/lib/luma/types";
import { getQrPreviewSize } from "@/lib/qr-image";
import { formatTicketTimestamp } from "@/lib/timestamp";
import { getPreviewShellClass } from "@/lib/types";

interface LumaReceiptPreviewProps {
  data: LumaReceiptData;
}

export function LumaReceiptPreview({ data }: LumaReceiptPreviewProps) {
  const { t } = useLocale();
  const shellClass = getPreviewShellClass(data.paperWidth);
  const logoSize = getLogoPreviewSize(data.paperWidth);
  const guestName = data.guestName.trim() || t.luma.previewGuestPlaceholder;
  const ticketName = data.ticketName?.trim();
  const eventName = data.eventName.trim() || t.luma.previewEventPlaceholder;

  return (
    <div className="flex w-full flex-col items-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        {t.app.preview}
      </p>
      <div className={shellClass}>
        <div className="flex flex-col items-center text-center">
          <Image
            src={LOGO_SRC}
            alt="Logo Cursor"
            width={logoSize.width}
            height={logoSize.height}
            className="mb-5"
            priority
          />
          <p className="mb-5 text-base font-semibold">{eventName}</p>

          <div className="mb-5 rounded bg-white p-2">
            <QRCode
              value={data.checkinUrl || " "}
              size={getQrPreviewSize(data.paperWidth)}
            />
          </div>

          <p>{t.luma.previewAction}</p>
          <p>{guestName}</p>
          {ticketName ? <p>{ticketName}</p> : null}
          {data.showTimestamp ? <p className="mb-4">{formatTicketTimestamp()}</p> : null}
        </div>
      </div>
    </div>
  );
}
