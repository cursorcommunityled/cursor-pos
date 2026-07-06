import { defaultReceiptData, type PaperWidth, type ReceiptData } from "./types";

const DEFAULTS_KEY = "cursor-pos-defaults";

function isPaperWidth(value: unknown): value is PaperWidth {
  return value === 58 || value === 80;
}

export function loadReceiptDefaults(): ReceiptData {
  if (typeof window === "undefined") {
    return defaultReceiptData;
  }

  try {
    const raw = window.localStorage.getItem(DEFAULTS_KEY);
    if (!raw) {
      return defaultReceiptData;
    }

    const parsed = JSON.parse(raw) as Partial<ReceiptData>;

    return {
      businessName: parsed.businessName ?? defaultReceiptData.businessName,
      nombre: parsed.nombre ?? defaultReceiptData.nombre,
      qrContent: parsed.qrContent ?? defaultReceiptData.qrContent,
      eventType: parsed.eventType ?? defaultReceiptData.eventType,
      actionLabel: parsed.actionLabel ?? defaultReceiptData.actionLabel,
      wifiSsid: parsed.wifiSsid ?? defaultReceiptData.wifiSsid,
      wifiPassword: parsed.wifiPassword ?? defaultReceiptData.wifiPassword,
      paperWidth: isPaperWidth(parsed.paperWidth)
        ? parsed.paperWidth
        : defaultReceiptData.paperWidth,
      showWifi: parsed.showWifi ?? defaultReceiptData.showWifi,
    };
  } catch {
    return defaultReceiptData;
  }
}

export function saveReceiptDefaults(data: ReceiptData): void {
  window.localStorage.setItem(DEFAULTS_KEY, JSON.stringify(data));
}
