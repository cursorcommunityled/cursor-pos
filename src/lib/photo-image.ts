function toEscPosSize(size: number): number {
  return Math.max(8, Math.round(size / 8) * 8);
}

/** Portrait frame: 3:5 reduced 40% in height -> 3:3 (square). */
export const PHOTO_FRAME_RATIO = 1;

export function getPhotoPreviewAspectClass(): string {
  return "aspect-square";
}

export function getPhotoPrintMaxWidth(paperWidth: 58 | 80): number {
  return toEscPosSize(paperWidth === 58 ? 320 : 464);
}

export function getPhotoPreviewMaxWidth(paperWidth: 58 | 80): number {
  return paperWidth === 58 ? 360 : 480;
}

function cropSourceToAspect(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  outputWidth: number,
): HTMLCanvasElement {
  const targetAspect = PHOTO_FRAME_RATIO;
  const sourceAspect = sourceWidth / sourceHeight;

  let cropWidth: number;
  let cropHeight: number;
  let sourceX: number;
  let sourceY: number;

  if (sourceAspect > targetAspect) {
    cropHeight = sourceHeight;
    cropWidth = cropHeight * targetAspect;
    sourceX = (sourceWidth - cropWidth) / 2;
    sourceY = 0;
  } else {
    cropWidth = sourceWidth;
    cropHeight = cropWidth / targetAspect;
    sourceX = 0;
    sourceY = (sourceHeight - cropHeight) / 2;
  }

  const outputHeight = Math.round(outputWidth / targetAspect);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar la foto.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, outputWidth, outputHeight);
  context.drawImage(
    source,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  return canvas;
}

export function cropVideoFrameToPhotoAspect(video: HTMLVideoElement): HTMLCanvasElement {
  return cropSourceToAspect(video, video.videoWidth, video.videoHeight, 960);
}

export async function normalizePhotoDataUrl(dataUrl: string): Promise<string> {
  const image = await loadImageFromDataUrl(dataUrl);
  const canvas = cropSourceToAspect(
    image,
    image.naturalWidth,
    image.naturalHeight,
    960,
  );

  return canvas.toDataURL("image/jpeg", 0.92);
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
  const targetWidth = getPhotoPrintMaxWidth(paperWidth);
  const targetHeight = toEscPosSize(Math.round(targetWidth / PHOTO_FRAME_RATIO));

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
