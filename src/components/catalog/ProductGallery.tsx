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
      <div className="aspect-[16/9] bg-slate-100 rounded-xl flex items-center justify-center">
        <ImageOff className="h-12 w-12 text-slate-300" />
      </div>
    );
  }

  const current = images[idx];
  const alt = (locale === 'ro' ? current.altRo : current.altEn) || 'Vehicle';

  function prev() { setIdx(idx === 0 ? images.length - 1 : idx - 1); }
  function next() { setIdx(idx === images.length - 1 ? 0 : idx + 1); }

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div className="relative aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden group ring-1 ring-slate-200">
        <img
          src={current.url}
          alt={alt}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="eager"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {current.type && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
            {current.type}
          </span>
        )}

        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold tabular-nums">
          {idx + 1}/{images.length}
        </span>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`relative w-16 h-11 rounded-lg overflow-hidden flex-shrink-0 ring-2 transition-all ${
                i === idx ? 'ring-[#E63946] shadow-sm' : 'ring-transparent opacity-50 hover:opacity-90'
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
