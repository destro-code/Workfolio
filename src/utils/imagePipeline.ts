import type { StoredAsset } from '../types/portfolio';

export interface ProcessedImageResult {
  asset: StoredAsset;
  assetRef: string;
}

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.86;

/**
 * Reads a user-selected File, resizes oversized dimensions via HTMLCanvasElement,
 * compresses to WebP/JPEG, and returns a StoredAsset ready for Dexie persistence.
 */
export async function processUploadedImageFile(
  file: File,
  portfolioId: string
): Promise<ProcessedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, WebP, or SVG).');
  }

  const rawDataUrl = await readFileAsDataUrl(file);

  // Preserve SVGs cleanly without rasterization
  if (file.type === 'image/svg+xml') {
    const id = `ast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const asset: StoredAsset = {
      id,
      portfolioId,
      dataUrl: rawDataUrl,
      mimeType: file.type,
      width: 1200,
      height: 900,
      filename: file.name,
      createdAt: Date.now(),
    };
    return { asset, assetRef: `asset:${id}` };
  }

  const img = await loadHtmlImage(rawDataUrl);
  let targetWidth = img.naturalWidth || 1200;
  let targetHeight = img.naturalHeight || 900;

  if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / targetWidth, MAX_DIMENSION / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser canvas rendering context unavailable.');
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const outputMime =
    file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
  let optimizedDataUrl = canvas.toDataURL(outputMime, JPEG_QUALITY);
  // Fallback if webp encoding isn't supported in a specific headless environment
  if (!optimizedDataUrl.startsWith('data:image/')) {
    optimizedDataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  }

  const id = `ast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const asset: StoredAsset = {
    id,
    portfolioId,
    dataUrl: optimizedDataUrl,
    mimeType: outputMime,
    width: targetWidth,
    height: targetHeight,
    filename: file.name,
    createdAt: Date.now(),
  };

  return {
    asset,
    assetRef: `asset:${id}`,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read file contents.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.readAsDataURL(file);
  });
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode uploaded image.'));
    img.src = src;
  });
}

export function resolveImageSrc(src: string, assetMap: Record<string, string>): string {
  if (src.startsWith('asset:')) {
    const id = src.slice('asset:'.length);
    return assetMap[id] || '';
  }
  return src;
}
