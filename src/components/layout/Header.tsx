'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Menu, X, ChevronRight, Search, Zap, Car, Globe } from 'lucide-react';
import { LocaleSwitcher } from './LocaleSwitcher';
import { TopBar } from './TopBar';
import { useState, useEffect } from 'react';

export function Header() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/brands', label: t('brands') },
    { href: '/search', label: t('search') },
    { href: '/compare', label: t('compare') },
  ];

  const isHome = pathname === '/';

  return (
    <>
      <TopBar />

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
            : isHome
              ? 'bg-transparent'
              : 'bg-white border-b border-slate-100'
        }`}
      >
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 z-10">
            <span
              className={`text-xl lg:text-2xl font-semibold tracking-tight transition-colors duration-300 ${
                scrolled || !isHome ? 'text-slate-900' : 'text-white'
              }`}
            >
              China<span className="text-[#E63946]">Cars</span>
              <span className="font-normal opacity-60">.Global</span>
            </span>
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 hover:text-[#E63946] ${
                  pathname === item.href
                    ? 'text-[#E63946]'
                    : scrolled || !isHome
                      ? 'text-slate-700'
                      : 'text-white/90'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side — globe + hamburger */}
          <div className="flex items-center gap-2 z-10">
            {/* Globe / locale on mobile */}
            <div className="md:hidden">
              <LocaleSwitcher />
            </div>

            {/* Hamburger — always visible */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                menuOpen
                  ? 'bg-slate-100 text-slate-900'
                  : scrolled || !isHome
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-white hover:bg-white/10'
              }`}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mega Menu / Full-screen Drawer ─────────────────────── */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          menuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl transform transition-transform duration-500 ease-out ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Close button */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <span className="text-lg font-bold text-slate-900">
              China<span className="text-[#E63946]">Cars</span>
              <span className="font-normal text-slate-400">.Global</span>
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="p-6 space-y-1">
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between py-4 px-4 rounded-xl text-lg font-medium transition-all duration-200 group ${
                  pathname === item.href
                    ? 'bg-[#E63946]/5 text-[#E63946]'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {item.label}
                <ChevronRight
                  className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                    pathname === item.href ? 'text-[#E63946]' : 'text-slate-300'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Quick actions */}
          <div className="mx-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Quick Search
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/search?propulsion=BEV"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-3 px-4 rounded-xl bg-slate-50 text-sm font-medium text-slate-600 hover:bg-[#E63946]/5 hover:text-[#E63946] transition-colors"
              >
                <Zap className="h-4 w-4" />
                Electric (BEV)
              </Link>
              <Link
                href="/search?segment=suv"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-3 px-4 rounded-xl bg-slate-50 text-sm font-medium text-slate-600 hover:bg-[#E63946]/5 hover:text-[#E63946] transition-colors"
              >
                <Car className="h-4 w-4" />
                SUVs
              </Link>
              <Link
                href="/search?priceMax=30000"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-3 px-4 rounded-xl bg-slate-50 text-sm font-medium text-slate-600 hover:bg-[#E63946]/5 hover:text-[#E63946] transition-colors"
              >
                <Globe className="h-4 w-4" />
                Under €30k
              </Link>
              <Link
                href="/search?euHomologated=true"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-3 px-4 rounded-xl bg-slate-50 text-sm font-medium text-slate-600 hover:bg-[#E63946]/5 hover:text-[#E63946] transition-colors"
              >
                <Search className="h-4 w-4" />
                EU Ready
              </Link>
            </div>
          </div>

          {/* Contact footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              info@chinacars.global · +40 700 000 000
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
