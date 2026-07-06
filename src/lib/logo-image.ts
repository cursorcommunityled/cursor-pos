export const LOGO_SRC = "/CUBE_2D_LIGHT.svg";

export const LOGO_ASPECT_RATIO = 466.73 / 532.09;

/** ESC/POS raster images require width and height divisible by 8. */
function toEscPosSize(width: number): { width: number; height: number } {
  const snappedWidth = Math.max(8, Math.round(width / 8) * 8);
  const rawHeight = snappedWidth / LOGO_ASPECT_RATIO;
  const snappedHeight = Math.max(8, Math.round(rawHeight / 8) * 8);

  return { width: snappedWidth, height: snappedHeight };
}

export function getLogoPreviewSize(paperWidth: 58 | 80): { width: number; height: number } {
  return toEscPosSize(paperWidth === 58 ? 200 : 280);
}

export function getLogoPrintSize(paperWidth: 58 | 80): { width: number; height: number } {
  return toEscPosSize(paperWidth === 58 ? 176 : 256);
}

export function getLogoPrintSizeSmall(paperWidth: 58 | 80): { width: number; height: number } {
  return toEscPosSize(paperWidth === 58 ? 96 : 128);
}

export function getLogoPreviewSizeSmall(paperWidth: 58 | 80): { width: number; height: number } {
  return toEscPosSize(paperWidth === 58 ? 80 : 104);
}

let cachedLogo: Map<number, HTMLCanvasElement> = new Map();
let cachedLogoSmall: Map<number, HTMLCanvasElement> = new Map();

async function renderLogoCanvas(
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.decoding = "async";
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("No se pudo cargar el logo del ticket."));
    element.src = LOGO_SRC;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar el canvas del logo.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas;
}

export async function loadLogoCanvas(
  paperWidth: 58 | 80,
): Promise<HTMLCanvasElement> {
  const cached = cachedLogo.get(paperWidth);
  if (cached) {
    return cached;
  }

  if (typeof window === "undefined") {
    throw new Error("El logo solo se puede cargar en el navegador.");
  }

  const size = getLogoPrintSize(paperWidth);
  const canvas = await renderLogoCanvas(size.width, size.height);
  cachedLogo.set(paperWidth, canvas);
  return canvas;
}

export async function loadLogoCanvasSmall(
  paperWidth: 58 | 80,
): Promise<HTMLCanvasElement> {
  const cached = cachedLogoSmall.get(paperWidth);
  if (cached) {
    return cached;
  }

  if (typeof window === "undefined") {
    throw new Error("El logo solo se puede cargar en el navegador.");
  }

  const size = getLogoPrintSizeSmall(paperWidth);
  const canvas = await renderLogoCanvas(size.width, size.height);
  cachedLogoSmall.set(paperWidth, canvas);
  return canvas;
}

export function clearLogoCache(): void {
  cachedLogo = new Map();
  cachedLogoSmall = new Map();
}
