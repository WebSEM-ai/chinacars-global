import { getTranslations, setRequestLocale } from 'next-intl/server';
import { db } from '@/db';
import { models, brands, images } from '@/db/schema';
import { eq, and, gte, lte, ilike, sql, desc, asc } from 'drizzle-orm';
import { ModelCard } from '@/components/catalog/ModelCard';
import { FilterSidebar } from '@/components/catalog/FilterSidebar';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { Search as SearchIcon } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface SearchParams {
  q?: string;
  propulsion?: string;
  segment?: string;
  priceMin?: string;
  priceMax?: string;
  rangeMin?: string;
  euHomologated?: string;
  sort?: string;
  page?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'search' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/search`,
      languages: { en: '/en/search', ro: '/ro/search' },
    },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'search' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Build filter conditions
  const conditions = [eq(models.isPublished, true)];

  if (sp.q) {
    conditions.push(
      sql`(${ilike(models.name, `%${sp.q}%`)} OR ${ilike(models.slug, `%${sp.q}%`)})`
    );
  }

  if (sp.propulsion && sp.propulsion !== 'all') {
    conditions.push(eq(models.propulsion, sp.propulsion));
  }

  if (sp.segment && sp.segment !== 'all') {
    conditions.push(eq(models.segment, sp.segment));
  }

  if (sp.priceMin) {
    const min = parseInt(sp.priceMin, 10);
    if (!isNaN(min)) {
      conditions.push(gte(models.priceEurFrom, min));
    }
  }

  if (sp.priceMax) {
    const max = parseInt(sp.priceMax, 10);
    if (!isNaN(max)) {
      conditions.push(lte(models.priceEurFrom, max));
    }
  }

  if (sp.rangeMin) {
    const rangeMin = parseInt(sp.rangeMin, 10);
    if (!isNaN(rangeMin)) {
      conditions.push(gte(models.rangeWltpKm, rangeMin));
    }
  }

  if (sp.euHomologated === 'true') {
    conditions.push(eq(models.euHomologated, true));
  }

  // Sorting
  let orderBy;
  switch (sp.sort) {
    case 'price-asc':
      orderBy = [asc(models.priceEurFrom)];
      break;
    case 'price-desc':
      orderBy = [desc(models.priceEurFrom)];
      break;
    case 'range-desc':
      orderBy = [desc(models.rangeWltpKm)];
      break;
    case 'power-desc':
      orderBy = [desc(models.powerHp)];
      break;
    case 'name-asc':
      orderBy = [asc(models.name)];
      break;
    default:
      orderBy = [desc(models.isFeatured), desc(models.sortOrder)];
  }

  // Execute query
  const results = await db.query.models.findMany({
    where: and(...conditions),
    with: {
      brand: true,
      images: true,
    },
    orderBy,
  });

  // Pagination
  const page = parseInt(sp.page || '1', 10);
  const perPage = 12;
  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / perPage);
  const paginatedResults = results.slice((page - 1) * perPage, page * perPage);

  const breadcrumbItems = [
    { label: tCommon('home'), href: '/' },
    { label: t('title') },
  ];

  // Check if any filters are active
  const hasActiveFilters = !!(
    sp.q ||
    (sp.propulsion && sp.propulsion !== 'all') ||
    (sp.segment && sp.segment !== 'all') ||
    sp.priceMin ||
    sp.priceMax ||
    sp.rangeMin ||
    sp.euHomologated
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl flex items-center gap-3">
          <SearchIcon className="h-8 w-8 text-primary" />
          {t('title')}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {hasActiveFilters
            ? t('resultsCount', { count: totalResults })
            : t('subtitle')}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filter Sidebar */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-lg border bg-card p-5">
            <FilterSidebar />
          </div>
        </div>

        {/* Results */}
        <div>
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {t('showing', {
                from: (page - 1) * perPage + 1,
                to: Math.min(page * perPage, totalResults),
                total: totalResults,
              })}
            </p>
          </div>

          {/* Results Grid */}
          {paginatedResults.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedResults.map((model) => {
                const heroImage =
                  model.images.find((img) => img.type === 'hero') ||
                  model.images[0];
                return (
                  <ModelCard
                    key={model.slug}
                    slug={model.slug}
                    brandSlug={model.brand.slug}
                    brandName={model.brand.name}
                    name={model.name}
                    imageUrl={heroImage?.url ?? null}
                    propulsion={model.propulsion}
                    priceEurFrom={model.priceEurFrom}
                    rangeWltpKm={model.rangeWltpKm}
                    powerHp={model.powerHp}
                    year={model.year}
                    isFeatured={model.isFeatured}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg text-muted-foreground">{t('noResults')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('noResultsHint')}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-2"
              aria-label="Pagination"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  const params = new URLSearchParams();
                  if (sp.q) params.set('q', sp.q);
                  if (sp.propulsion) params.set('propulsion', sp.propulsion);
                  if (sp.segment) params.set('segment', sp.segment);
                  if (sp.priceMin) params.set('priceMin', sp.priceMin);
                  if (sp.priceMax) params.set('priceMax', sp.priceMax);
                  if (sp.rangeMin) params.set('rangeMin', sp.rangeMin);
                  if (sp.euHomologated) params.set('euHomologated', sp.euHomologated);
                  if (sp.sort) params.set('sort', sp.sort);
                  params.set('page', pageNum.toString());

                  return (
                    <a
                      key={pageNum}
                      href={`/${locale}/search?${params.toString()}`}
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                        pageNum === page
                          ? 'bg-primary text-primary-foreground'
                          : 'border hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {pageNum}
                    </a>
                  );
                }
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
