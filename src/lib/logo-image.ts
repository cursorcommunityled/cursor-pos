export const LOGO_SRC = "/CUBE_2D_LIGHT.svg";

export const LOGO_ASPECT_RATIO = 466.73 / 532.09;

let cachedLogo: HTMLImageElement | null = null;

function sizeFromWidth(width: number): { width: number; height: number } {
  return {
    width,
    height: Math.round(width / LOGO_ASPECT_RATIO),
  };
}

export function getLogoPreviewSize(paperWidth: 58 | 80): { width: number; height: number } {
  return sizeFromWidth(paperWidth === 58 ? 120 : 168);
}

export function getLogoPrintSize(paperWidth: 58 | 80): { width: number; height: number } {
  return sizeFromWidth(paperWidth === 58 ? 176 : 256);
}

export async function loadLogoImage(): Promise<HTMLImageElement> {
  if (cachedLogo) {
    return cachedLogo;
  }

  if (typeof window === "undefined") {
    throw new Error("El logo solo se puede cargar en el navegador.");
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";

    image.onload = () => {
      cachedLogo = image;
      resolve(image);
    };

    image.onerror = () => {
      reject(new Error("No se pudo cargar el logo del ticket."));
    };

    image.src = LOGO_SRC;
  });
}
