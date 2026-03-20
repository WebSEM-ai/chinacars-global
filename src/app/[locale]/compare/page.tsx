import { getTranslations, setRequestLocale } from 'next-intl/server';
import { db } from '@/db';
import { models, brands } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { CompareSelector } from '@/components/compare/CompareSelector';
import { CompareTable } from '@/components/compare/CompareTable';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { GitCompareArrows } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'compare' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/compare`,
      languages: { en: '/en/compare', ro: '/ro/compare' },
    },
  };
}

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ models?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'compare' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Parse selected model slugs from searchParams
  const selectedSlugs = sp.models
    ? sp.models.split(',').filter(Boolean).slice(0, 4)
    : [];

  // Query all published models for the selector dropdown
  const allPublishedModels = await db.query.models.findMany({
    where: eq(models.isPublished, true),
    with: { brand: true },
    orderBy: [models.name],
  });

  const selectorModels = allPublishedModels.map((m) => ({
    slug: m.slug,
    name: m.name,
    brandName: m.brand.name,
  }));

  // Query the selected models with full data for comparison
  let selectedModels: Array<{
    slug: string;
    name: string;
    brandSlug: string;
    brandName: string;
    imageUrl: string | null;
    propulsion: string | null;
    segment: string | null;
    year: number | null;
    priceEurFrom: number | null;
    priceEurTo: number | null;
    batteryKwh: string | null;
    rangeWltpKm: number | null;
    powerKw: number | null;
    powerHp: number | null;
    torqueNm: number | null;
    topSpeedKmh: number | null;
    acceleration0100: string | null;
    lengthMm: number | null;
    widthMm: number | null;
    heightMm: number | null;
    wheelbaseMm: number | null;
    trunkLiters: number | null;
    seats: number | null;
    driveType: string | null;
    chargeTimeDcMin: number | null;
    chargePowerDcKw: string | null;
    chargePowerAcKw: string | null;
    ncapStars: number | null;
    euHomologated: boolean | null;
    warrantyYears: number | null;
    warrantyKm: number | null;
  }> = [];

  if (selectedSlugs.length > 0) {
    const selectedData = await db.query.models.findMany({
      where: inArray(models.slug, selectedSlugs),
      with: { brand: true, images: true },
    });

    // Maintain the order from the URL
    selectedModels = selectedSlugs
      .map((slug) => selectedData.find((m) => m.slug === slug))
      .filter(Boolean)
      .map((m) => {
        const heroImage =
          m!.images.find((img) => img.type === 'hero') || m!.images[0];
        return {
          slug: m!.slug,
          name: m!.name,
          brandSlug: m!.brand.slug,
          brandName: m!.brand.name,
          imageUrl: heroImage?.url ?? null,
          propulsion: m!.propulsion,
          segment: m!.segment,
          year: m!.year,
          priceEurFrom: m!.priceEurFrom,
          priceEurTo: m!.priceEurTo,
          batteryKwh: m!.batteryKwh,
          rangeWltpKm: m!.rangeWltpKm,
          powerKw: m!.powerKw,
          powerHp: m!.powerHp,
          torqueNm: m!.torqueNm,
          topSpeedKmh: m!.topSpeedKmh,
          acceleration0100: m!.acceleration0100,
          lengthMm: m!.lengthMm,
          widthMm: m!.widthMm,
          heightMm: m!.heightMm,
          wheelbaseMm: m!.wheelbaseMm,
          trunkLiters: m!.trunkLiters,
          seats: m!.seats,
          driveType: m!.driveType,
          chargeTimeDcMin: m!.chargeTimeDcMin,
          chargePowerDcKw: m!.chargePowerDcKw,
          chargePowerAcKw: m!.chargePowerAcKw,
          ncapStars: m!.ncapStars,
          euHomologated: m!.euHomologated,
          warrantyYears: m!.warrantyYears,
          warrantyKm: m!.warrantyKm,
        };
      });
  }

  const breadcrumbItems = [
    { label: tCommon('home'), href: '/' },
    { label: t('title') },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl flex items-center gap-3">
          <GitCompareArrows className="h-8 w-8 text-primary" />
          {t('title')}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          {t('subtitle')}
        </p>
      </div>

      {/* Selector */}
      <div className="mb-8 rounded-lg border bg-card p-6">
        <h2 className="font-semibold text-lg mb-4">{t('selectModels')}</h2>
        <CompareSelector models={selectorModels} selectedSlugs={selectedSlugs} />
      </div>

      {/* Comparison Table */}
      {selectedModels.length >= 2 ? (
        <div className="rounded-lg border bg-card p-2 sm:p-4">
          <CompareTable models={selectedModels} />
        </div>
      ) : selectedModels.length === 1 ? (
        <div className="text-center py-16 text-muted-foreground">
          <GitCompareArrows className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg">{t('addOneMore')}</p>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <GitCompareArrows className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg">{t('emptyState')}</p>
          <p className="text-sm mt-2">{t('emptyStateHint')}</p>
        </div>
      )}
    </div>
  );
}
