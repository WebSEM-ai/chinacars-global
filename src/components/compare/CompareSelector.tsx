'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface ModelOption {
  slug: string;
  name: string;
  brandName: string;
}

interface CompareSelectorProps {
  models: ModelOption[];
  selectedSlugs: string[];
}

export function CompareSelector({ models, selectedSlugs }: CompareSelectorProps) {
  const t = useTranslations('compare');
  const router = useRouter();
  const pathname = usePathname();

  function updateModels(slugs: string[]) {
    const params = new URLSearchParams();
    if (slugs.length > 0) {
      params.set('models', slugs.join(','));
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function addModel(slug: string | null) {
    if (!slug || selectedSlugs.length >= 4 || selectedSlugs.includes(slug)) return;
    updateModels([...selectedSlugs, slug]);
  }

  function removeModel(slug: string) {
    updateModels(selectedSlugs.filter((s) => s !== slug));
  }

  const availableModels = models.filter((m) => !selectedSlugs.includes(m.slug));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selectedSlugs.map((slug) => {
          const model = models.find((m) => m.slug === slug);
          if (!model) return null;
          return (
            <div
              key={slug}
              className="flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm font-medium"
            >
              {model.brandName} {model.name}
              <button onClick={() => removeModel(slug)} className="hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {selectedSlugs.length < 4 && (
        <div className="flex items-center gap-2">
          <Select onValueChange={addModel}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t('addModel')} />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.slug} value={model.slug}>
                  {model.brandName} {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedSlugs.length >= 4 && (
        <p className="text-sm text-muted-foreground">{t('maxModels')}</p>
      )}
    </div>
  );
}
