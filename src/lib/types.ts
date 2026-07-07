export type PaperWidth = 58 | 80;

export type TicketMode = "event" | "photo";

export interface ReceiptData {
  businessName: string;
  nombre: string;
  extra: string;
  qrContent: string;
  eventType: string;
  actionLabel: string;
  wifiSsid: string;
  wifiPassword: string;
  paperWidth: PaperWidth;
  showWifi: boolean;
}

export interface PhotoTicketData {
  nombre: string;
  extra: string;
  paperWidth: PaperWidth;
  photoDataUrl: string | null;
}

export const defaultReceiptData: ReceiptData = {
  businessName: "Cursor Meetup - San José",
  nombre: "Juan Santamaría",
  extra: "",
  qrContent: "https://luma.com/cursor-san-jose-costa-rica",
  eventType: "Drop-by slot",
  actionLabel: "Check-in",
  wifiSsid: "Taller.1",
  wifiPassword: "@Salvo20",
  paperWidth: 58,
  showWifi: true,
};

export const defaultPhotoTicketData: PhotoTicketData = {
  nombre: "Juan Santamaría",
  extra: "",
  paperWidth: 58,
  photoDataUrl: null,
};

export function getPreviewWidthClass(paperWidth: PaperWidth): string {
  return paperWidth === 58 ? "w-[400px]" : "w-[520px]";
}

export function getPreviewShellClass(paperWidth: PaperWidth): string {
  return `${getPreviewWidthClass(paperWidth)} rounded-sm bg-white px-8 py-9 font-mono text-[14px] leading-relaxed text-black shadow-[0_24px_80px_rgba(0,0,0,0.2)]`;
}
