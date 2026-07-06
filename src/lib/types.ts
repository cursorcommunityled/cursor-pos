export type PaperWidth = 58 | 80;

export interface ReceiptData {
  businessName: string;
  nombre: string;
  qrContent: string;
  eventType: string;
  actionLabel: string;
  wifiSsid: string;
  wifiPassword: string;
  paperWidth: PaperWidth;
  showWifi: boolean;
}

export const defaultReceiptData: ReceiptData = {
  businessName: "Cursor Meetup - San José",
  nombre: "Juan Santamaría",
  qrContent: "https://luma.com/cursor-san-jose-costa-rica",
  eventType: "Drop-by slot",
  actionLabel: "Check-in",
  wifiSsid: "Taller.1",
  wifiPassword: "@Salvo20",
  paperWidth: 58,
  showWifi: true,
};
