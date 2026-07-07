import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

import { getLogoPrintSize, loadLogoCanvas } from "./logo-image";
import type { LumaReceiptData } from "./luma/types";
import { getQrPrintSize, loadQrCanvas } from "./qr-image";
import type { ReceiptEncoderOptions } from "./receipt";
import { sanitizeForPrinter } from "./text-encoding";
import { formatTicketTimestamp } from "./timestamp";

const DEFAULT_CODEPAGE_MAPPING = "pos-5890";

function columnsForWidth(paperWidth: LumaReceiptData["paperWidth"]): number {
  return paperWidth === 58 ? 32 : 48;
}

function createEncoder(encoderOptions?: ReceiptEncoderOptions, width?: number) {
  return new ReceiptPrinterEncoder({
    language: encoderOptions?.language ?? "esc-pos",
    width: width ?? 32,
    codepageMapping: encoderOptions?.codepageMapping ?? DEFAULT_CODEPAGE_MAPPING,
  });
}

async function appendLogo(
  encoder: ReceiptPrinterEncoder,
  paperWidth: LumaReceiptData["paperWidth"],
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const logo = await loadLogoCanvas(paperWidth);
    const size = getLogoPrintSize(paperWidth);
    encoder
      .align("center")
      .image(logo, size.width, size.height, "threshold", 160)
      .newline();
  } catch {
    // Continue without logo if it fails to load.
  }
}

async function appendQr(
  encoder: ReceiptPrinterEncoder,
  content: string,
  paperWidth: LumaReceiptData["paperWidth"],
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const qr = await loadQrCanvas(content, paperWidth);
    const size = getQrPrintSize(paperWidth);
    encoder
      .align("center")
      .image(qr, size.width, size.height, "threshold", 128)
      .newline();
  } catch {
    encoder.align("center").line(sanitizeForPrinter(content)).newline();
  }
}

export async function buildLumaReceiptBuffer(
  data: LumaReceiptData,
  encoderOptions?: ReceiptEncoderOptions,
): Promise<Uint8Array> {
  const width = columnsForWidth(data.paperWidth);
  const timestamp = formatTicketTimestamp();
  const encoder = createEncoder(encoderOptions, width);

  const eventName = sanitizeForPrinter(data.eventName.trim());
  const guestName = sanitizeForPrinter(data.guestName.trim());
  const ticketName = sanitizeForPrinter(data.ticketName?.trim() ?? "");

  encoder.initialize().align("center");
  await appendLogo(encoder, data.paperWidth);

  encoder.bold(true).line(eventName).bold(false).newline();

  await appendQr(encoder, data.checkinUrl, data.paperWidth);

  encoder.align("center").line("Check-in").line(guestName);

  if (ticketName) {
    encoder.line(ticketName);
  }

  if (data.showTimestamp) {
    encoder.line(timestamp);
  }

  encoder.newline(3).cut();

  return encoder.encode();
}
