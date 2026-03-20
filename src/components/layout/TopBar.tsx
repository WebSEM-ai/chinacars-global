'use client';

import { useTranslations } from 'next-intl';
import { Mail, Phone } from 'lucide-react';
import { LocaleSwitcher } from './LocaleSwitcher';

export function TopBar() {
  return (
    <div className="hidden md:block w-full bg-slate-900 text-slate-300 border-b border-slate-800">
      <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-10 flex items-center justify-between h-8 text-xs">
        <div className="flex items-center gap-5">
          <a
            href="mailto:info@chinacars.global"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="h-3 w-3" />
            info@chinacars.global
          </a>
          <a
            href="tel:+40700000000"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="h-3 w-3" />
            +40 700 000 000
          </a>
        </div>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  );
}
