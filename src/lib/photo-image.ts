function toEscPosSize(size: number): number {
  return Math.max(8, Math.round(size / 8) * 8);
}

/** Portrait frame: 3:5 reduced 40% in height -> 3:3 (square). */
export const PHOTO_FRAME_RATIO = 1;

export interface PhotoFrameOffset {
  x: number;
  y: number;
}

export const DEFAULT_PHOTO_FRAME_OFFSET: PhotoFrameOffset = { x: 0.5, y: 0.5 };

function clampOffset(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function clampPhotoFrameOffset(offset: PhotoFrameOffset): PhotoFrameOffset {
  return {
    x: clampOffset(offset.x),
    y: clampOffset(offset.y),
  };
}

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
  offset: PhotoFrameOffset = DEFAULT_PHOTO_FRAME_OFFSET,
): HTMLCanvasElement {
  const targetAspect = PHOTO_FRAME_RATIO;
  const sourceAspect = sourceWidth / sourceHeight;
  const normalizedOffset = clampPhotoFrameOffset(offset);

  let cropWidth: number;
  let cropHeight: number;
  let sourceX: number;
  let sourceY: number;

  if (sourceAspect > targetAspect) {
    cropHeight = sourceHeight;
    cropWidth = cropHeight * targetAspect;
    sourceX = (sourceWidth - cropWidth) * normalizedOffset.x;
    sourceY = 0;
  } else {
    cropWidth = sourceWidth;
    cropHeight = cropWidth / targetAspect;
    sourceX = 0;
    sourceY = (sourceHeight - cropHeight) * normalizedOffset.y;
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

export function computePhotoCoverLayout(
  sourceWidth: number,
  sourceHeight: number,
  frameSize: number,
  offset: PhotoFrameOffset,
): { width: number; height: number; left: number; top: number; canPanX: boolean; canPanY: boolean } {
  if (sourceWidth === 0 || sourceHeight === 0 || frameSize === 0) {
    return {
      width: frameSize,
      height: frameSize,
      left: 0,
      top: 0,
      canPanX: false,
      canPanY: false,
    };
  }

  const normalizedOffset = clampPhotoFrameOffset(offset);
  const scale = Math.max(frameSize / sourceWidth, frameSize / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const maxPanX = Math.max(0, width - frameSize);
  const maxPanY = Math.max(0, height - frameSize);

  return {
    width,
    height,
    left: -maxPanX * normalizedOffset.x,
    top: -maxPanY * normalizedOffset.y,
    canPanX: maxPanX > 0,
    canPanY: maxPanY > 0,
  };
}

export function captureVideoFrameFull(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar la foto.");
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function cropVideoFrameToPhotoAspect(
  video: HTMLVideoElement,
  offset: PhotoFrameOffset = DEFAULT_PHOTO_FRAME_OFFSET,
): HTMLCanvasElement {
  return cropSourceToAspect(video, video.videoWidth, video.videoHeight, 960, offset);
}

export async function normalizePhotoSourceDataUrl(dataUrl: string): Promise<string> {
  const image = await loadImageFromDataUrl(dataUrl);
  const maxDimension = 1920;
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (Math.max(width, height) > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar la foto.");
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.92);
}

/** @deprecated Use normalizePhotoSourceDataUrl and renderPhotoDataUrl instead. */
export async function normalizePhotoDataUrl(dataUrl: string): Promise<string> {
  const source = await normalizePhotoSourceDataUrl(dataUrl);
  return renderPhotoDataUrl(source, DEFAULT_PHOTO_FRAME_OFFSET);
}

export async function renderPhotoDataUrl(
  sourceDataUrl: string,
  offset: PhotoFrameOffset,
  outputWidth = 960,
): Promise<string> {
  const image = await loadImageFromDataUrl(sourceDataUrl);
  const canvas = cropSourceToAspect(
    image,
    image.naturalWidth,
    image.naturalHeight,
    outputWidth,
    offset,
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
