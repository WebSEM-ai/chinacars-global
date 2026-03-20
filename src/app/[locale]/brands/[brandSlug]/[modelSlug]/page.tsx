import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { models, brands } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { ImageGallery } from '@/components/catalog/ImageGallery';
import { SpecsTable } from '@/components/catalog/SpecsTable';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Check,
  X,
  Shield,
  Wrench,
  ExternalLink,
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; brandSlug: string; modelSlug: string }>;
}): Promise<Metadata> {
  const { locale, brandSlug, modelSlug } = await params;

  const model = await db.query.models.findFirst({
    where: eq(models.slug, modelSlug),
    with: { brand: true, images: true },
  });

  if (!model) return {};

  const description =
    locale === 'ro' ? model.descriptionRo : model.descriptionEn;
  const heroImage =
    model.images.find((img) => img.type === 'hero') || model.images[0];
  const title = `${model.brand.name} ${model.name}${model.year ? ` ${model.year}` : ''}`;

  return {
    title,
    description:
      description?.slice(0, 160) ||
      `${title} — specs, price, range, and availability. ${model.propulsion || ''} ${model.segment || ''}`.trim(),
    openGraph: {
      title,
      description:
        description?.slice(0, 160) ||
        `Explore the ${title} — full specs, pricing & comparisons on ChinaCars.Global`,
      type: 'website',
      images: heroImage
        ? [
            {
              url: heroImage.url,
              width: 1200,
              height: 630,
              alt:
                (locale === 'ro' ? heroImage.altRo : heroImage.altEn) ||
                title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description:
        description?.slice(0, 160) ||
        `Explore the ${title} on ChinaCars.Global`,
      images: heroImage ? [heroImage.url] : [],
    },
    alternates: {
      canonical: `/${locale}/brands/${brandSlug}/${modelSlug}`,
      languages: {
        en: `/en/brands/${brandSlug}/${modelSlug}`,
        ro: `/ro/brands/${brandSlug}/${modelSlug}`,
      },
    },
  };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ locale: string; brandSlug: string; modelSlug: string }>;
}) {
  const { locale, brandSlug, modelSlug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'model' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tBrands = await getTranslations({ locale, namespace: 'brands' });

  const model = await db.query.models.findFirst({
    where: eq(models.slug, modelSlug),
    with: {
      brand: true,
      images: true,
      variants: {
        orderBy: (v, { asc }) => [asc(v.sortOrder)],
      },
    },
  });

  if (!model || !model.isPublished) notFound();

  // Verify brand slug matches
  if (model.brand.slug !== brandSlug) notFound();

  const description =
    locale === 'ro' ? model.descriptionRo : model.descriptionEn;
  const highlights = (
    locale === 'ro' ? model.highlightsRo : model.highlightsEn
  ) as string[] | null;

  const sortedImages = [...model.images].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  const fullName = `${model.brand.name} ${model.name}`;

  // Breadcrumbs
  const breadcrumbItems = [
    { label: tCommon('home'), href: '/' },
    { label: tBrands('title'), href: '/brands' },
    { label: model.brand.name, href: `/brands/${brandSlug}` },
    { label: model.name },
  ];

  // JSON-LD (Car schema)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: fullName,
    brand: {
      '@type': 'Organization',
      name: model.brand.name,
    },
    model: model.name,
    vehicleModelDate: model.year?.toString(),
    fuelType:
      model.propulsion === 'BEV'
        ? 'Electric'
        : model.propulsion === 'PHEV'
          ? 'Plug-in Hybrid Electric'
          : model.propulsion === 'HEV'
            ? 'Hybrid Electric'
            : 'Gasoline',
    driveWheelConfiguration: model.driveType || undefined,
    vehicleEngine: model.powerKw
      ? {
          '@type': 'EngineSpecification',
          enginePower: {
            '@type': 'QuantitativeValue',
            value: model.powerKw,
            unitCode: 'KWT',
          },
          torque: model.torqueNm
            ? {
                '@type': 'QuantitativeValue',
                value: model.torqueNm,
                unitCode: 'NM',
              }
            : undefined,
        }
      : undefined,
    speed: model.topSpeedKmh
      ? {
          '@type': 'QuantitativeValue',
          value: model.topSpeedKmh,
          unitCode: 'KMH',
        }
      : undefined,
    seatingCapacity: model.seats || undefined,
    image: sortedImages[0]?.url || undefined,
    description: description || undefined,
    offers: model.priceEurFrom
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'EUR',
          lowPrice: model.priceEurFrom,
          highPrice: model.priceEurTo || model.priceEurFrom,
        }
      : undefined,
  };

  // Specs data
  const performanceSpecs = [
    { label: t('powerOutput'), value: model.powerHp, unit: 'hp' },
    { label: t('powerKw'), value: model.powerKw, unit: 'kW' },
    { label: t('torque'), value: model.torqueNm, unit: 'Nm' },
    { label: t('topSpeed'), value: model.topSpeedKmh, unit: 'km/h' },
    {
      label: t('acceleration'),
      value: model.acceleration0100 ? `${model.acceleration0100}s` : null,
    },
    { label: t('driveType'), value: model.driveType },
  ];

  const batterySpecs = [
    {
      label: t('batteryCapacity'),
      value: model.batteryKwh ? `${model.batteryKwh}` : null,
      unit: 'kWh',
    },
    { label: t('wltpRange'), value: model.rangeWltpKm, unit: 'km' },
    {
      label: t('dcChargePower'),
      value: model.chargePowerDcKw ? `${model.chargePowerDcKw}` : null,
      unit: 'kW',
    },
    {
      label: t('acChargePower'),
      value: model.chargePowerAcKw ? `${model.chargePowerAcKw}` : null,
      unit: 'kW',
    },
    {
      label: t('dcChargeTime'),
      value: model.chargeTimeDcMin,
      unit: 'min',
    },
  ];

  const dimensionSpecs = [
    { label: t('length'), value: model.lengthMm, unit: 'mm' },
    { label: t('width'), value: model.widthMm, unit: 'mm' },
    { label: t('height'), value: model.heightMm, unit: 'mm' },
    { label: t('wheelbase'), value: model.wheelbaseMm, unit: 'mm' },
    { label: t('trunkVolume'), value: model.trunkLiters, unit: 'L' },
    { label: t('seats'), value: model.seats },
  ];

  const safetySpecs = [
    {
      label: t('ncapRating'),
      value: model.ncapStars ? `${model.ncapStars} / 5` : null,
    },
    { label: t('euHomologated'), value: model.euHomologated },
    {
      label: t('euTariff'),
      value: model.euTariffPct ? `${model.euTariffPct}%` : null,
    },
    { label: t('serviceInEurope'), value: model.serviceEurope },
    {
      label: t('warranty'),
      value:
        model.warrantyYears && model.warrantyKm
          ? `${model.warrantyYears} ${t('years')} / ${model.warrantyKm.toLocaleString()} km`
          : model.warrantyYears
            ? `${model.warrantyYears} ${t('years')}`
            : null,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd data={jsonLd} />

      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">
        {/* ─── Left Column: Gallery & Info ──────────────────────── */}
        <div className="space-y-8">
          {/* Image Gallery */}
          {sortedImages.length > 0 && (
            <ImageGallery
              images={sortedImages.map((img) => ({
                url: img.url,
                thumbUrl: img.thumbUrl,
                altEn: img.altEn,
                altRo: img.altRo,
                type: img.type,
              }))}
              locale={locale}
            />
          )}

          {/* Model Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {model.propulsion && (
                <Badge variant="secondary">{model.propulsion}</Badge>
              )}
              {model.segment && (
                <Badge variant="outline" className="capitalize">
                  {model.segment}
                </Badge>
              )}
              {model.euHomologated && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  <Check className="h-3 w-3 mr-1" />
                  {t('euApproved')}
                </Badge>
              )}
              {model.isFeatured && <Badge>{t('featured')}</Badge>}
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {fullName}
              {model.year && (
                <span className="text-muted-foreground font-normal ml-2">
                  {model.year}
                </span>
              )}
            </h1>
          </div>

          {/* Price Range */}
          {(model.priceEurFrom || model.priceUsdFrom) && (
            <div className="rounded-lg border bg-card p-6">
              <h2 className="font-semibold text-lg mb-3">{t('pricing')}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {model.priceEurFrom && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('priceEur')}</p>
                    <p className="text-2xl font-bold text-primary">
                      &euro;{model.priceEurFrom.toLocaleString()}
                      {model.priceEurTo &&
                        model.priceEurTo !== model.priceEurFrom && (
                          <span className="text-lg font-normal text-muted-foreground">
                            {' '}
                            &mdash; &euro;{model.priceEurTo.toLocaleString()}
                          </span>
                        )}
                    </p>
                  </div>
                )}
                {model.priceUsdFrom && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('priceUsd')}</p>
                    <p className="text-2xl font-bold">
                      ${model.priceUsdFrom.toLocaleString()}
                      {model.priceUsdTo &&
                        model.priceUsdTo !== model.priceUsdFrom && (
                          <span className="text-lg font-normal text-muted-foreground">
                            {' '}
                            &mdash; ${model.priceUsdTo.toLocaleString()}
                          </span>
                        )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div>
              <h2 className="font-semibold text-xl mb-3">{t('about')}</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <div>
              <h2 className="font-semibold text-xl mb-3">{t('highlights')}</h2>
              <ul className="space-y-2">
                {highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Video Embed */}
          {model.videoUrl && (
            <div>
              <h2 className="font-semibold text-xl mb-3">{t('video')}</h2>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={model.videoUrl}
                  title={`${fullName} video`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Variants Table */}
          {model.variants.length > 0 && (
            <div>
              <h2 className="font-semibold text-xl mb-3">{t('variants')}</h2>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('variantName')}</TableHead>
                      <TableHead className="text-right">{t('priceEur')}</TableHead>
                      <TableHead className="text-right">{t('batteryCapacity')}</TableHead>
                      <TableHead className="text-right">{t('wltpRange')}</TableHead>
                      <TableHead className="text-right">{t('powerOutput')}</TableHead>
                      <TableHead className="text-center">{t('driveType')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {model.variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-medium">{variant.name}</TableCell>
                        <TableCell className="text-right">
                          {variant.priceEur
                            ? `€${variant.priceEur.toLocaleString()}`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {variant.batteryKwh ? `${variant.batteryKwh} kWh` : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {variant.rangeWltpKm
                            ? `${variant.rangeWltpKm} km`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {variant.powerHp ? `${variant.powerHp} hp` : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          {variant.driveType || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right Column: Specs ──────────────────────────────── */}
        <div className="space-y-6">
          <div className="sticky top-4 space-y-6">
            <SpecsTable
              title={t('performanceSpecs')}
              specs={performanceSpecs}
            />
            <SpecsTable
              title={t('batteryCharging')}
              specs={batterySpecs}
            />
            <SpecsTable
              title={t('dimensions')}
              specs={dimensionSpecs}
            />
            <SpecsTable
              title={t('safetyCompliance')}
              specs={safetySpecs}
            />

            {/* Markets */}
            {model.markets && model.markets.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">{t('availableMarkets')}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {model.markets.map((market) => (
                    <Badge key={market} variant="outline" className="text-xs">
                      {market}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
