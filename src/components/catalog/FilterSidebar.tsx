'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SlidersHorizontal } from 'lucide-react';

const propulsionTypes = ['BEV', 'PHEV', 'HEV', 'ICE'];
const segments = ['sedan', 'suv', 'hatchback', 'mpv', 'pickup', 'coupe', 'wagon'];

export function FilterSidebar() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function resetFilters() {
    router.push(pathname);
  }

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {t('common.filters')}
        </h2>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          {t('common.resetFilters')}
        </Button>
      </div>

      {/* Propulsion */}
      <div className="space-y-2">
        <Label>{t('search.propulsion')}</Label>
        <Select
          value={searchParams.get('propulsion') || ''}
          onValueChange={(v) => updateFilter('propulsion', v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('search.allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.allTypes')}</SelectItem>
            {propulsionTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`propulsions.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Segment */}
      <div className="space-y-2">
        <Label>{t('search.segment')}</Label>
        <Select
          value={searchParams.get('segment') || ''}
          onValueChange={(v) => updateFilter('segment', v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('search.allSegments')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.allSegments')}</SelectItem>
            {segments.map((seg) => (
              <SelectItem key={seg} value={seg}>
                {t(`segments.${seg}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>{t('search.priceRange')}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={t('common.from')}
            value={searchParams.get('priceMin') || ''}
            onChange={(e) => updateFilter('priceMin', e.target.value || null)}
          />
          <Input
            type="number"
            placeholder={t('common.to')}
            value={searchParams.get('priceMax') || ''}
            onChange={(e) => updateFilter('priceMax', e.target.value || null)}
          />
        </div>
      </div>

      {/* Range km */}
      <div className="space-y-2">
        <Label>{t('search.rangeKm')}</Label>
        <Input
          type="number"
          placeholder={`Min km`}
          value={searchParams.get('rangeMin') || ''}
          onChange={(e) => updateFilter('rangeMin', e.target.value || null)}
        />
      </div>

      {/* EU Homologated */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="euHomologated"
          checked={searchParams.get('euHomologated') === 'true'}
          onCheckedChange={(checked) =>
            updateFilter('euHomologated', checked ? 'true' : null)
          }
        />
        <Label htmlFor="euHomologated">{t('model.euHomologated')}</Label>
      </div>
    </aside>
  );
}
