import { SERVER_URL, USE_MOCK_API } from './config';

// Kthen adresën e plotë të fotos.
// Fotot e ngarkuara në server vijnë si "/uploads/cars/...", prandaj u shtojmë adresën e backend-it.
export function imageSrc(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  if (url.startsWith('/uploads/') && !USE_MOCK_API) {
    return SERVER_URL + url;
  }
  return url;
}

// Zvogëlon foton para ngarkimit (p.sh. 4000px nga telefoni → 1600px, ~200–400 KB).
// Kështu ngarkimi është i shpejtë dhe faqja hapet shpejt.
export async function resizeImage(file: File, maxSize = 1600, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return file;
  }
  // sfond i bardhë për PNG me transparencë
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Foto nuk u përpunua.'))),
      'image/jpeg',
      quality
    );
  });
}
