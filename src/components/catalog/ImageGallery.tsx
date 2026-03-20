'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GalleryImage {
  url: string;
  thumbUrl: string | null;
  altEn: string | null;
  altRo: string | null;
  type: string | null;
}

export function ImageGallery({ images, locale }: { images: GalleryImage[]; locale: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  const selected = images[selectedIndex];
  const alt = locale === 'ro' ? selected.altRo : selected.altEn;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[16/10] bg-muted rounded-lg overflow-hidden">
        <Image
          src={selected.url}
          alt={alt || 'Vehicle image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative w-20 h-14 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                i === selectedIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
              }`}
            >
              <Image
                src={img.thumbUrl || img.url}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
