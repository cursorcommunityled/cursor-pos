function toEscPosSize(size: number): number {
  return Math.max(8, Math.round(size / 8) * 8);
}

export function getPhotoPrintMaxWidth(paperWidth: 58 | 80): number {
  return toEscPosSize(paperWidth === 58 ? 320 : 464);
}

export function getPhotoPreviewMaxWidth(paperWidth: 58 | 80): number {
  return paperWidth === 58 ? 360 : 480;
}

export async function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar la foto."));
    image.src = dataUrl;
  });
}

export async function preparePhotoCanvas(
  dataUrl: string,
  paperWidth: 58 | 80,
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  const image = await loadImageFromDataUrl(dataUrl);
  const maxWidth = getPhotoPrintMaxWidth(paperWidth);
  const scale = maxWidth / image.width;
  const targetWidth = toEscPosSize(maxWidth);
  const targetHeight = toEscPosSize(Math.max(8, Math.round(image.height * scale)));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar la foto para imprimir.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  return { canvas, width: targetWidth, height: targetHeight };
}
