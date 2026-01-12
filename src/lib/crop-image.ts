export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

const MAX_CANVAS_SIZE = 4096;

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  let outputWidth = pixelCrop.width;
  let outputHeight = pixelCrop.height;
  let scale = 1;

  if (outputWidth > MAX_CANVAS_SIZE || outputHeight > MAX_CANVAS_SIZE) {
    scale = MAX_CANVAS_SIZE / Math.max(outputWidth, outputHeight);
    outputWidth = Math.round(outputWidth * scale);
    outputHeight = Math.round(outputHeight * scale);
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.92
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}
