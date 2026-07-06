const LOGO_SRC = "/logo.svg";

let cachedLogo: HTMLImageElement | null = null;

export function getLogoPrintSize(paperWidth: 58 | 80): { width: number; height: number } {
  return paperWidth === 58
    ? { width: 160, height: 160 }
    : { width: 240, height: 240 };
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
