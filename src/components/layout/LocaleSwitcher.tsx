'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locale === 'en' ? 'ro' : 'en';

  function switchLocale() {
    router.replace(pathname, { locale: otherLocale });
  }

  return (
    <button
      onClick={switchLocale}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-colors hover:bg-white/10"
      aria-label={`Switch to ${otherLocale}`}
    >
      <Globe className="h-3.5 w-3.5" />
      {otherLocale}
    </button>
  );
}
