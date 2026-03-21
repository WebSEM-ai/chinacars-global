'use client';

import { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

interface Brand {
  slug: string;
  name: string;
  logoUrl: string | null;
}

interface BrandCarouselProps {
  brands: Brand[];
}

export function BrandCarousel({ brands }: BrandCarouselProps) {
  // Duplicate brands to ensure seamless looping
  const items = [...brands, ...brands];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      dragFree: true,
    },
    [Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {items.map((brand, i) => (
          <div
            key={`${brand.slug}-${i}`}
            className="flex-[0_0_33.333%] sm:flex-[0_0_25%] md:flex-[0_0_20%] lg:flex-[0_0_16.666%] min-w-0 px-3"
          >
            <Link href={`/brands/${brand.slug}`}>
              <div className="group flex flex-col items-center justify-center py-6 px-4 rounded-xl border border-slate-100 bg-white hover:shadow-lg hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 h-[100px]">
                {brand.logoUrl ? (
                  <div className="relative w-full h-12 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300">
                    <Image
                      src={brand.logoUrl}
                      alt={brand.name}
                      fill
                      className="object-contain"
                      sizes="150px"
                    />
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-slate-300 group-hover:text-slate-900 transition-colors">
                    {brand.name}
                  </span>
                )}
                <span className="mt-2 text-[11px] font-medium text-slate-400 group-hover:text-slate-600 tracking-wide uppercase transition-colors">
                  {brand.name}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
