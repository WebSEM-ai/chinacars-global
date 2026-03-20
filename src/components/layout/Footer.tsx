import { useTranslations } from 'next-intl';
import { Car } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            <span className="font-bold">ChinaCars<span className="text-primary">.Global</span></span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {t('tagline')}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">{t('disclaimer')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('copyright', { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
