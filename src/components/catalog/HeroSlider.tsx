'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { Search, Zap, Car, ArrowDown } from 'lucide-react';

const slides = [
  {
    src: '/images/BYD-SEAL-6-DM-i.webp',
    alt: 'BYD Seal 6 DM-i — Premium electric sedan',
  },
  {
    src: '/images/byd-seal-5-dm-i-1stBanner-xl.webp',
    alt: 'BYD Seal 5 DM-i — Coastal highway',
  },
  {
    src: '/images/BYD-SEAL.webp',
    alt: 'BYD Seal — Dynamic driving',
  },
];

interface HeroSliderProps {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  chipBev: string;
  chipSuv: string;
  chipUnder30k: string;
}

export function HeroSlider({
  title,
  subtitle,
  searchPlaceholder,
  chipBev,
  chipSuv,
  chipUnder30k,
}: HeroSliderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 40 },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  }

  function scrollToContent() {
    window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' });
  }

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] max-h-[1000px] -mt-16 lg:-mt-[72px]">
      {/* ─── Image Slider ─────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div key={i} className="relative flex-[0_0_100%] min-w-0 h-full">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className={`object-cover transition-transform duration-[7000ms] ease-out ${
                  activeIndex === i ? 'scale-105' : 'scale-100'
                }`}
                sizes="100vw"
                priority={i === 0}
                quality={90}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ─── Overlay Gradient ─────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* ─── Content ──────────────────────────────────────────────── */}
      <div className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 pt-16 lg:pt-[72px]">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            <span className="block">{title.split(' ').slice(0, -1).join(' ')}</span>
            <span className="block text-[#E63946]">{title.split(' ').slice(-1)}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            {subtitle}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-2xl transition-all duration-300 group-focus-within:bg-white/95 group-focus-within:shadow-2xl group-focus-within:shadow-black/10" />
              <div className="relative flex items-center">
                <Search className="absolute left-5 h-5 w-5 text-white/50 group-focus-within:text-slate-400 transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-14 sm:h-16 pl-14 pr-32 bg-transparent text-white group-focus-within:text-slate-900 placeholder:text-white/40 group-focus-within:placeholder:text-slate-400 text-base sm:text-lg rounded-2xl outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 h-10 sm:h-12 px-6 sm:px-8 bg-[#E63946] hover:bg-[#d32f3c] text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#E63946]/25"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Quick Filter Chips */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs sm:text-sm text-white/40 mr-1">Popular:</span>
            <a
              href="/en/search?propulsion=BEV"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs sm:text-sm font-medium backdrop-blur-sm transition-all duration-200 border border-white/10 hover:border-white/20"
            >
              <Zap className="h-3.5 w-3.5" />
              {chipBev}
            </a>
            <a
              href="/en/search?segment=suv"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs sm:text-sm font-medium backdrop-blur-sm transition-all duration-200 border border-white/10 hover:border-white/20"
            >
              <Car className="h-3.5 w-3.5" />
              {chipSuv}
            </a>
            <a
              href="/en/search?priceMax=30000"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs sm:text-sm font-medium backdrop-blur-sm transition-all duration-200 border border-white/10 hover:border-white/20"
            >
              Under €30k
            </a>
          </div>
        </div>

        {/* ─── Slide Indicators ────────────────────────────────────── */}
        <div className="absolute bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`transition-all duration-300 rounded-full ${
                activeIndex === i
                  ? 'w-8 h-2 bg-[#E63946]'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* ─── Scroll Indicator ────────────────────────────────────── */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors animate-bounce"
          aria-label="Scroll down"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
