import QRCode from "qrcode";

import { LOGO_ASPECT_RATIO, LOGO_SRC } from "./logo-image";

export const QR_GENERATOR_SIZES = [512, 1024, 2048] as const;
export type QrGeneratorSize = (typeof QR_GENERATOR_SIZES)[number];

const LOGO_AREA_RATIO = 0.22;

async function loadLogoImage(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar el logo de Cursor."));
    image.src = LOGO_SRC;
  });
}

export async function buildBrandedQrCanvas(
  content: string,
  size: QrGeneratorSize = 1024,
): Promise<HTMLCanvasElement> {
  if (typeof window === "undefined") {
    throw new Error("El QR solo se puede generar en el navegador.");
  }

  const value = content.trim();
  if (!value) {
    throw new Error("Ingresa un link o texto para generar el QR.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, value, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar el canvas del QR.");
  }

  const logo = await loadLogoImage();
  const logoArea = Math.round(size * LOGO_AREA_RATIO);
  const padding = Math.round(logoArea * 0.14);
  const center = size / 2;
  const half = logoArea / 2;

  context.fillStyle = "#ffffff";
  context.fillRect(center - half, center - half, logoArea, logoArea);

  const maxWidth = logoArea - padding * 2;
  const maxHeight = logoArea - padding * 2;
  let drawWidth = maxWidth;
  let drawHeight = drawWidth / LOGO_ASPECT_RATIO;

  if (drawHeight > maxHeight) {
    drawHeight = maxHeight;
    drawWidth = drawHeight * LOGO_ASPECT_RATIO;
  }

  context.drawImage(
    logo,
    center - drawWidth / 2,
    center - drawHeight / 2,
    drawWidth,
    drawHeight,
  );

  return canvas;
}

export function canvasToPngDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

export function downloadBrandedQr(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement("a");
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  link.href = canvasToPngDataUrl(canvas);
  link.click();
}

export function slugifyFilename(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "cursor-qr";
}
