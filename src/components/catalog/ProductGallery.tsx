'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

interface GalleryImage {
  url: string;
  thumbUrl: string | null;
  altEn: string | null;
  altRo: string | null;
  type: string | null;
}

export function ProductGallery({ images, locale }: { images: GalleryImage[]; locale: string }) {
  const [idx, setIdx] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-slate-100 rounded-2xl flex items-center justify-center">
        <ImageOff className="h-16 w-16 text-slate-300" />
      </div>
    );
  }

  const current = images[idx];
  const alt = (locale === 'ro' ? current.altRo : current.altEn) || 'Vehicle';

  function prev() { setIdx(idx === 0 ? images.length - 1 : idx - 1); }
  function next() { setIdx(idx === images.length - 1 ? 0 : idx + 1); }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[16/9] bg-slate-100 rounded-2xl overflow-hidden group">
        <img
          src={current.url}
          alt={alt}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="eager"
        />

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image type badge */}
        {current.type && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-xs font-medium capitalize">
            {current.type}
          </span>
        )}

        {/* Counter */}
        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
          {idx + 1} / {images.length}
        </span>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                i === idx ? 'border-[#E63946] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.thumbUrl || img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
