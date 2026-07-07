"use client";

import Image from "next/image";
import QRCode from "react-qr-code";

import { LOGO_SRC, getLogoPreviewSize } from "@/lib/logo-image";
import { getQrPreviewSize } from "@/lib/qr-image";
import { getPreviewShellClass, type ReceiptData } from "@/lib/types";
import { formatTicketTimestamp } from "@/lib/timestamp";
import { useLocale } from "@/lib/i18n/locale-context";

interface ReceiptPreviewProps {
  data: ReceiptData;
}

export function ReceiptPreview({ data }: ReceiptPreviewProps) {
  const { t } = useLocale();
  const shellClass = getPreviewShellClass(data.paperWidth);
  const logoSize = getLogoPreviewSize(data.paperWidth);

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
          <p className="mb-5 text-base font-semibold">{data.businessName}</p>

          <div className="mb-5 rounded bg-white p-2">
            <QRCode value={data.qrContent || " "} size={getQrPreviewSize(data.paperWidth)} />
          </div>

          <p>{data.eventType}</p>
          <p>{data.actionLabel}</p>
          {data.nombre.trim() ? <p>{data.nombre.trim()}</p> : null}
          {data.extra.trim() ? <p>{data.extra.trim()}</p> : null}
          {data.showTimestamp ? <p className="mb-4">{formatTicketTimestamp()}</p> : null}

          {data.showWifi ? (
            <div>
              <p className="font-semibold">{t.app.wifi}</p>
              <p>
                {t.app.wifiNetwork}: {data.wifiSsid}
              </p>
              <p>
                {t.app.wifiPassword}: {data.wifiPassword}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
