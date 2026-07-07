import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

import { getLogoPrintSizeSmall, loadLogoCanvasSmall } from "./logo-image";
import { preparePhotoCanvas } from "./photo-image";
import { sanitizeForPrinter } from "./text-encoding";
import { formatTicketTimestamp } from "./timestamp";
import type { PhotoTicketData } from "./types";

export interface ReceiptEncoderOptions {
  language?: string;
  codepageMapping?: string;
}

const DEFAULT_CODEPAGE_MAPPING = "pos-5890";

function columnsForWidth(paperWidth: PhotoTicketData["paperWidth"]): number {
  return paperWidth === 58 ? 32 : 48;
}

function createEncoder(encoderOptions?: ReceiptEncoderOptions, width?: number) {
  return new ReceiptPrinterEncoder({
    language: encoderOptions?.language ?? "esc-pos",
    width: width ?? 32,
    codepageMapping: encoderOptions?.codepageMapping ?? DEFAULT_CODEPAGE_MAPPING,
  });
}

export async function buildPhotoReceiptBuffer(
  data: PhotoTicketData,
  encoderOptions?: ReceiptEncoderOptions,
): Promise<Uint8Array> {
  if (!data.photoDataUrl) {
    throw new Error("Toma o selecciona una foto antes de imprimir.");
  }

  const width = columnsForWidth(data.paperWidth);
  const encoder = createEncoder(encoderOptions, width);
  const nombre = sanitizeForPrinter(data.nombre.trim()) || "Invitado";
  const extra = sanitizeForPrinter(data.extra.trim());
  const timestamp = formatTicketTimestamp();

  encoder.initialize().align("center");

  const photo = await preparePhotoCanvas(data.photoDataUrl, data.paperWidth);
  encoder
    .image(photo.canvas, photo.width, photo.height, "floydsteinberg", 140)
    .newline(2);

  encoder.bold(true).line(nombre).bold(false);

  if (extra) {
    encoder.line(extra);
  }

  if (data.showTimestamp) {
    encoder.newline().line(timestamp);
  }

  encoder.newline(2);

  const logoSize = getLogoPrintSizeSmall(data.paperWidth);
  const logo = await loadLogoCanvasSmall(data.paperWidth);
  encoder.image(logo, logoSize.width, logoSize.height, "threshold", 160);

  encoder.newline(3).cut();

  return encoder.encode();
}
