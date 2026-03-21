'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SlidersHorizontal, Star } from 'lucide-react';

const propulsionTypes = ['BEV', 'PHEV', 'HEV', 'ICE'];
const segments = ['sedan', 'suv', 'hatchback', 'mpv', 'pickup', 'coupe', 'wagon'];

interface FilterSidebarProps {
  brands?: { slug: string; name: string }[];
}

export function FilterSidebar({ brands = [] }: FilterSidebarProps) {
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

  const activeCount = [
    searchParams.get('brand') && searchParams.get('brand') !== 'all',
    searchParams.get('propulsion') && searchParams.get('propulsion') !== 'all',
    searchParams.get('segment') && searchParams.get('segment') !== 'all',
    searchParams.get('priceMin'),
    searchParams.get('priceMax'),
    searchParams.get('rangeMin'),
    searchParams.get('powerMin'),
    searchParams.get('seatsMin'),
    searchParams.get('ncapMin'),
    searchParams.get('euHomologated'),
  ].filter(Boolean).length;

  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {t('common.filters')}
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E63946] text-white text-xs font-bold">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
            {t('common.resetFilters')}
          </Button>
        )}
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('common.brands')}
          </Label>
          <Select
            value={searchParams.get('brand') || ''}
            onValueChange={(v) => updateFilter('brand', v || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('common.allBrands')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.allBrands')}</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.slug} value={brand.slug}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Propulsion */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('search.propulsion')}
        </Label>
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
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('search.segment')}
        </Label>
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

      <hr className="border-slate-100" />

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('search.priceRange')}
        </Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={t('common.from')}
            value={searchParams.get('priceMin') || ''}
            onChange={(e) => updateFilter('priceMin', e.target.value || null)}
            className="text-sm"
          />
          <Input
            type="number"
            placeholder={t('common.to')}
            value={searchParams.get('priceMax') || ''}
            onChange={(e) => updateFilter('priceMax', e.target.value || null)}
            className="text-sm"
          />
        </div>
        {/* Quick price chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: '< €25k', max: '25000' },
            { label: '< €35k', max: '35000' },
            { label: '< €50k', max: '50000' },
          ].map((chip) => (
            <button
              key={chip.max}
              onClick={() => {
                updateFilter('priceMin', null);
                updateFilter('priceMax', chip.max);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                searchParams.get('priceMax') === chip.max && !searchParams.get('priceMin')
                  ? 'bg-[#E63946] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Range km */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('search.rangeKm')}
        </Label>
        <Input
          type="number"
          placeholder="Min km"
          value={searchParams.get('rangeMin') || ''}
          onChange={(e) => updateFilter('rangeMin', e.target.value || null)}
          className="text-sm"
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: '300+ km', value: '300' },
            { label: '400+ km', value: '400' },
            { label: '500+ km', value: '500' },
          ].map((chip) => (
            <button
              key={chip.value}
              onClick={() => updateFilter('rangeMin', chip.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                searchParams.get('rangeMin') === chip.value
                  ? 'bg-[#E63946] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Power min */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('search.powerHp')}
        </Label>
        <Input
          type="number"
          placeholder="Min hp"
          value={searchParams.get('powerMin') || ''}
          onChange={(e) => updateFilter('powerMin', e.target.value || null)}
          className="text-sm"
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: '150+ hp', value: '150' },
            { label: '200+ hp', value: '200' },
            { label: '300+ hp', value: '300' },
          ].map((chip) => (
            <button
              key={chip.value}
              onClick={() => updateFilter('powerMin', chip.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                searchParams.get('powerMin') === chip.value
                  ? 'bg-[#E63946] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Seats */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('search.minSeats')}
        </Label>
        <Select
          value={searchParams.get('seatsMin') || ''}
          onValueChange={(v) => updateFilter('seatsMin', v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('search.anySeats')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.anySeats')}</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
            <SelectItem value="7">7+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* NCAP Stars */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('search.ncapStars')}
        </Label>
        <Select
          value={searchParams.get('ncapMin') || ''}
          onValueChange={(v) => updateFilter('ncapMin', v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('search.anyRating')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.anyRating')}</SelectItem>
            <SelectItem value="5">★★★★★ (5)</SelectItem>
            <SelectItem value="4">★★★★☆ (4+)</SelectItem>
            <SelectItem value="3">★★★☆☆ (3+)</SelectItem>
          </SelectContent>
        </Select>
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
        <Label htmlFor="euHomologated" className="text-sm">{t('model.euHomologated')}</Label>
      </div>

      {/* Sort */}
      <hr className="border-slate-100" />
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('common.sortBy')}
        </Label>
        <Select
          value={searchParams.get('sort') || ''}
          onValueChange={(v) => updateFilter('sort', v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('search.sortRelevance')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">{t('search.sortRelevance')}</SelectItem>
            <SelectItem value="price-asc">{t('search.sortPriceAsc')}</SelectItem>
            <SelectItem value="price-desc">{t('search.sortPriceDesc')}</SelectItem>
            <SelectItem value="range-desc">{t('search.sortRangeDesc')}</SelectItem>
            <SelectItem value="power-desc">{t('search.sortPowerDesc')}</SelectItem>
            <SelectItem value="name-asc">{t('search.sortNameAsc')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </aside>
  );
}
