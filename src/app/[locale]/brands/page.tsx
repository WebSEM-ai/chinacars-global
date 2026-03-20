import { getTranslations, setRequestLocale } from 'next-intl/server';
import { db } from '@/db';
import { brands, models } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { BrandCard } from '@/components/catalog/BrandCard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'brands' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/brands`,
      languages: { en: '/en/brands', ro: '/ro/brands' },
    },
  };
}

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'brands' });

  const allBrands = await db.query.brands.findMany({
    where: eq(brands.isPublished, true),
    with: {
      models: {
        where: eq(models.isPublished, true),
      },
    },
    orderBy: [brands.sortOrder, brands.name],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          {t('subtitle')}
        </p>
      </div>

      {/* Brands Grid */}
      {allBrands.length > 0 ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {allBrands.map((brand) => (
            <BrandCard
              key={brand.slug}
              slug={brand.slug}
              name={brand.name}
              logoUrl={brand.logoUrl}
              modelCount={brand.models.length}
              foundedYear={brand.foundedYear}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">{t('noBrands')}</p>
        </div>
      )}
    </div>
  );
}
