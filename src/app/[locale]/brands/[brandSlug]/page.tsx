import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { brands, models, images } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ModelCard } from '@/components/catalog/ModelCard';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import Image from 'next/image';
import { Globe, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; brandSlug: string }>;
}): Promise<Metadata> {
  const { locale, brandSlug } = await params;
  const t = await getTranslations({ locale, namespace: 'brands' });

  const brand = await db.query.brands.findFirst({
    where: eq(brands.slug, brandSlug),
  });

  if (!brand) return {};

  const description =
    locale === 'ro' ? brand.descriptionRo : brand.descriptionEn;

  return {
    title: `${brand.name} — ${t('metaTitleSuffix')}`,
    description:
      description?.slice(0, 160) ||
      `${brand.name} Chinese car models, specs, prices and availability.`,
    alternates: {
      canonical: `/${locale}/brands/${brandSlug}`,
      languages: {
        en: `/en/brands/${brandSlug}`,
        ro: `/ro/brands/${brandSlug}`,
      },
    },
  };
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ locale: string; brandSlug: string }>;
}) {
  const { locale, brandSlug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'brands' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const brand = await db.query.brands.findFirst({
    where: eq(brands.slug, brandSlug),
    with: {
      models: {
        where: eq(models.isPublished, true),
        with: {
          images: true,
          brand: true,
        },
        orderBy: [models.sortOrder, models.name],
      },
    },
  });

  if (!brand || !brand.isPublished) notFound();

  const description =
    locale === 'ro' ? brand.descriptionRo : brand.descriptionEn;

  const breadcrumbItems = [
    { label: tCommon('home'), href: '/' },
    { label: t('title'), href: '/brands' },
    { label: brand.name },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: tCommon('home'),
        item: `https://chinacars.global/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('title'),
        item: `https://chinacars.global/${locale}/brands`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: brand.name,
        item: `https://chinacars.global/${locale}/brands/${brandSlug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd data={jsonLd} />

      {/* Breadcrumbs */}
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
        {brand.logoUrl ? (
          <div className="relative w-28 h-20 flex-shrink-0">
            <Image
              src={brand.logoUrl}
              alt={`${brand.name} logo`}
              fill
              className="object-contain"
              sizes="112px"
            />
          </div>
        ) : (
          <div className="w-28 h-20 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center text-3xl font-bold text-muted-foreground">
            {brand.name.charAt(0)}
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {brand.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {brand.foundedYear && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {t('established')} {brand.foundedYear}
              </span>
            )}
            {brand.websiteUrl && (
              <a
                href={brand.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                {t('officialWebsite')}
              </a>
            )}
            <Badge variant="secondary">
              {brand.models.length} {brand.models.length === 1 ? t('model') : t('models')}
            </Badge>
          </div>

          {description && (
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Models Grid */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('modelsBy', { brand: brand.name })}</h2>
      </div>

      {brand.models.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brand.models.map((model) => {
            const heroImage =
              model.images.find((img) => img.type === 'hero') || model.images[0];
            return (
              <ModelCard
                key={model.slug}
                slug={model.slug}
                brandSlug={brand.slug}
                brandName={brand.name}
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
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">{t('noModels')}</p>
        </div>
      )}
    </div>
  );
}
