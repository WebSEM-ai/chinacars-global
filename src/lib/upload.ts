import { put, del } from '@vercel/blob';

export async function uploadImage(
  file: File,
  folder: string
): Promise<{ url: string; thumbUrl: string }> {
  const filename = `${folder}/${Date.now()}-${file.name}`;

  const blob = await put(filename, file, {
    access: 'public',
  });

  // For MVP, use the same URL for thumb (Vercel Blob serves images via CDN)
  // In production, add sharp resizing
  return {
    url: blob.url,
    thumbUrl: blob.url,
  };
}

export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Failed to delete image:', error);
  }
}
