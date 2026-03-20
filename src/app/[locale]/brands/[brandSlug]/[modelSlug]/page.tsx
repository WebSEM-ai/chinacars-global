import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { models, brands } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { ProductGallery } from '@/components/catalog/ProductGallery';
import { SpecsAccordion } from '@/components/catalog/SpecsAccordion';
import { MarketSidebar } from '@/components/catalog/MarketSidebar';
import { Badge } from '@/components/ui/badge';
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
  Gauge,
  Battery,
  Ruler,
  Shield,
  Cpu,
  Sofa,
  Zap,
  Globe,
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

  // Access fullSpec JSONB safely
  const spec = (model.fullSpec as any) || {};

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

  // ─── Build Spec Categories for SpecsAccordion ─────────────────────────────

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
    ...(spec.motor?.configuration
      ? [{ label: 'Motor Config', value: spec.motor.configuration }]
      : []),
    ...(spec.motor?.has_torque_vectoring !== undefined
      ? [{ label: 'Torque Vectoring', value: spec.motor.has_torque_vectoring as boolean }]
      : []),
  ];

  const batterySpecs = [
    {
      label: t('batteryCapacity'),
      value: model.batteryKwh ? `${model.batteryKwh}` : null,
      unit: 'kWh',
    },
    { label: t('wltpRange'), value: model.rangeWltpKm, unit: 'km', highlight: true },
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
    ...(spec.battery?.chemistry
      ? [{ label: 'Battery Chemistry', value: spec.battery.chemistry }]
      : []),
    ...(spec.battery?.brand_name
      ? [{ label: 'Battery Brand', value: spec.battery.brand_name }]
      : []),
    ...(spec.battery?.cell_to_body !== undefined
      ? [{ label: 'Cell-to-Body', value: spec.battery.cell_to_body as boolean }]
      : []),
    ...(spec.battery?.thermal_management
      ? [{ label: 'Thermal Management', value: spec.battery.thermal_management }]
      : []),
    ...(spec.charging?.connector_eu
      ? [{ label: 'EU Connector (DC)', value: spec.charging.connector_eu.dc },
         { label: 'EU Connector (AC)', value: spec.charging.connector_eu.ac }]
      : []),
    ...(spec.charging?.v2l !== undefined
      ? [{ label: 'V2L (Vehicle-to-Load)', value: spec.charging.v2l as boolean }]
      : []),
    ...(spec.charging?.v2g !== undefined
      ? [{ label: 'V2G (Vehicle-to-Grid)', value: spec.charging.v2g as boolean }]
      : []),
    ...(spec.charging?.v2h !== undefined
      ? [{ label: 'V2H (Vehicle-to-Home)', value: spec.charging.v2h as boolean }]
      : []),
  ];

  const dimensionSpecs = [
    { label: t('length'), value: model.lengthMm, unit: 'mm' },
    { label: t('width'), value: model.widthMm, unit: 'mm' },
    { label: t('height'), value: model.heightMm, unit: 'mm' },
    { label: t('wheelbase'), value: model.wheelbaseMm, unit: 'mm' },
    { label: t('trunkVolume'), value: model.trunkLiters, unit: 'L' },
    { label: t('seats'), value: model.seats },
    ...(spec.frunk
      ? [{ label: 'Frunk', value: spec.frunk, unit: 'L' }]
      : []),
    ...(spec.kerb_weight
      ? [{ label: 'Kerb Weight', value: spec.kerb_weight, unit: 'kg' }]
      : []),
    ...(spec.gross_weight
      ? [{ label: 'Gross Weight', value: spec.gross_weight, unit: 'kg' }]
      : []),
    ...(spec.ground_clearance
      ? [{ label: 'Ground Clearance', value: spec.ground_clearance, unit: 'mm' }]
      : []),
    ...(spec.drag_coefficient
      ? [{ label: 'Drag Coefficient', value: spec.drag_coefficient }]
      : []),
    ...(spec.turning_circle
      ? [{ label: 'Turning Circle', value: spec.turning_circle, unit: 'm' }]
      : []),
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
    ...(spec.airbags_count
      ? [{ label: 'Airbags', value: spec.airbags_count }]
      : []),
    ...(spec.torsional_stiffness
      ? [{ label: 'Torsional Stiffness', value: spec.torsional_stiffness, unit: 'Nm/deg' }]
      : []),
    ...(spec.adas_standard && Array.isArray(spec.adas_standard)
      ? [{ label: 'ADAS (Standard)', value: spec.adas_standard.join(', ') }]
      : []),
  ];

  const technologySpecs = [
    ...(spec.infotainment_screen
      ? [{ label: 'Infotainment Screen', value: spec.infotainment_screen }]
      : []),
    ...(spec.os
      ? [{ label: 'Operating System', value: spec.os }]
      : []),
    ...(spec.ota !== undefined
      ? [{ label: 'OTA Updates', value: spec.ota as boolean }]
      : []),
    ...(spec.carplay !== undefined
      ? [{ label: 'Apple CarPlay', value: spec.carplay as boolean }]
      : []),
    ...(spec.android_auto !== undefined
      ? [{ label: 'Android Auto', value: spec.android_auto as boolean }]
      : []),
    ...(spec.audio
      ? [{ label: 'Audio System', value: spec.audio }]
      : []),
    ...(spec.nfc_key !== undefined
      ? [{ label: 'NFC Key', value: spec.nfc_key as boolean }]
      : []),
    ...(spec.digital_key !== undefined
      ? [{ label: 'Digital Key', value: spec.digital_key as boolean }]
      : []),
    ...(spec.panoramic_roof !== undefined
      ? [{ label: 'Panoramic Roof', value: spec.panoramic_roof as boolean }]
      : []),
    ...(spec.autonomous_level
      ? [{ label: 'Autonomous Level', value: `L${spec.autonomous_level}` }]
      : []),
  ];

  const comfortSpecs = [
    ...(spec.climate_zones
      ? [{ label: 'Climate Zones', value: spec.climate_zones }]
      : []),
    ...(spec.heated_seats !== undefined
      ? [{ label: 'Heated Seats', value: spec.heated_seats as boolean }]
      : []),
    ...(spec.ventilated_seats !== undefined
      ? [{ label: 'Ventilated Seats', value: spec.ventilated_seats as boolean }]
      : []),
    ...(spec.massage_seats !== undefined
      ? [{ label: 'Massage Seats', value: spec.massage_seats as boolean }]
      : []),
    ...(spec.heated_steering !== undefined
      ? [{ label: 'Heated Steering Wheel', value: spec.heated_steering as boolean }]
      : []),
  ];

  const specCategories = [
    {
      id: 'performance',
      title: t('performanceSpecs'),
      icon: <Gauge className="h-4 w-4" />,
      specs: performanceSpecs,
    },
    {
      id: 'battery',
      title: t('batteryCharging'),
      icon: <Battery className="h-4 w-4" />,
      specs: batterySpecs,
    },
    {
      id: 'dimensions',
      title: t('dimensions'),
      icon: <Ruler className="h-4 w-4" />,
      specs: dimensionSpecs,
    },
    {
      id: 'safety',
      title: t('safetyCompliance'),
      icon: <Shield className="h-4 w-4" />,
      specs: safetySpecs,
    },
    ...(technologySpecs.length > 0
      ? [
          {
            id: 'technology',
            title: 'Technology',
            icon: <Cpu className="h-4 w-4" />,
            specs: technologySpecs,
          },
        ]
      : []),
    ...(comfortSpecs.length > 0
      ? [
          {
            id: 'comfort',
            title: 'Comfort',
            icon: <Sofa className="h-4 w-4" />,
            specs: comfortSpecs,
          },
        ]
      : []),
  ];

  // Hero quick spec pills
  const quickSpecs = [
    model.rangeWltpKm ? `${model.rangeWltpKm} km range` : null,
    model.powerHp ? `${model.powerHp} hp` : null,
    model.acceleration0100 ? `${model.acceleration0100}s 0-100` : null,
    model.topSpeedKmh ? `${model.topSpeedKmh} km/h` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd data={jsonLd} />

      {/* ─── Breadcrumbs ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* ─── Hero Banner ──────────────────────────────────────────────────── */}
      <section className="mt-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 w-full">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-4">
            {/* Brand name */}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {model.brand.name}
            </p>

            {/* Model name + Year */}
            <div className="flex flex-wrap items-end gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {model.name}
              </h1>
              {model.year && (
                <span className="mb-1 inline-flex items-center rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/80 backdrop-blur-sm sm:mb-2">
                  {model.year}
                </span>
              )}
            </div>

            {/* Price */}
            {model.priceEurFrom && (
              <p className="text-2xl font-bold text-[#E63946] sm:text-3xl">
                {'\u20AC'}{model.priceEurFrom.toLocaleString()}
                {model.priceEurTo && model.priceEurTo !== model.priceEurFrom && (
                  <span className="text-lg font-normal text-[#E63946]/60 sm:text-xl">
                    {' '}&mdash; {'\u20AC'}{model.priceEurTo.toLocaleString()}
                  </span>
                )}
              </p>
            )}

            {/* Quick spec pills */}
            {quickSpecs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {quickSpecs.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm"
                  >
                    <Zap className="h-3.5 w-3.5 text-[#E63946]" />
                    {pill}
                  </span>
                ))}
              </div>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {model.propulsion && (
                <Badge className="bg-[#E63946]/20 text-[#E63946] border-[#E63946]/30 hover:bg-[#E63946]/30">
                  {model.propulsion}
                </Badge>
              )}
              {model.segment && (
                <Badge variant="outline" className="capitalize border-white/20 text-white/70">
                  {model.segment}
                </Badge>
              )}
              {model.euHomologated && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">
                  <Check className="h-3 w-3 mr-1" />
                  EU Homologated
                </Badge>
              )}
              {model.isFeatured && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content + Sidebar ───────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
          {/* ─── Main Column ───────────────────────────────────────────── */}
          <div className="space-y-10">
            {/* Product Gallery */}
            {sortedImages.length > 0 && (
              <ProductGallery
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

            {/* Variants */}
            {model.variants.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">{t('variants')}</h2>
                {model.variants.length <= 4 ? (
                  /* Card layout for few variants */
                  <div className="grid gap-4 sm:grid-cols-2">
                    {model.variants.map((variant) => {
                      const isFeatured =
                        variant.powerHp === model.powerHp &&
                        variant.batteryKwh === model.batteryKwh;
                      return (
                        <div
                          key={variant.id}
                          className={`relative rounded-2xl border p-5 transition-shadow hover:shadow-md ${
                            isFeatured
                              ? 'border-[#E63946]/30 bg-[#E63946]/5 shadow-sm'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          {isFeatured && (
                            <span className="absolute -top-2.5 left-4 rounded-full bg-[#E63946] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                              Featured
                            </span>
                          )}
                          <h3 className="font-semibold text-slate-900 mb-3">
                            {variant.name}
                          </h3>
                          <div className="space-y-2 text-sm">
                            {variant.priceEur && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Price</span>
                                <span className="font-bold text-[#E63946]">
                                  {'\u20AC'}{variant.priceEur.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {variant.batteryKwh && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Battery</span>
                                <span className="font-medium text-slate-900">
                                  {variant.batteryKwh} kWh
                                </span>
                              </div>
                            )}
                            {variant.rangeWltpKm && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Range</span>
                                <span className="font-medium text-slate-900">
                                  {variant.rangeWltpKm} km
                                </span>
                              </div>
                            )}
                            {variant.powerHp && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Power</span>
                                <span className="font-medium text-slate-900">
                                  {variant.powerHp} hp
                                </span>
                              </div>
                            )}
                            {variant.driveType && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Drive</span>
                                <span className="font-medium text-slate-900">
                                  {variant.driveType}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Table layout for many variants */
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">{t('variantName')}</TableHead>
                          <TableHead className="text-right font-semibold">{t('priceEur')}</TableHead>
                          <TableHead className="text-right font-semibold">{t('batteryCapacity')}</TableHead>
                          <TableHead className="text-right font-semibold">{t('wltpRange')}</TableHead>
                          <TableHead className="text-right font-semibold">{t('powerOutput')}</TableHead>
                          <TableHead className="text-center font-semibold">{t('driveType')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {model.variants.map((variant) => {
                          const isFeatured =
                            variant.powerHp === model.powerHp &&
                            variant.batteryKwh === model.batteryKwh;
                          return (
                            <TableRow
                              key={variant.id}
                              className={isFeatured ? 'bg-[#E63946]/5' : ''}
                            >
                              <TableCell className="font-medium">
                                {variant.name}
                                {isFeatured && (
                                  <span className="ml-2 inline-flex rounded-full bg-[#E63946] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                                    Featured
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {variant.priceEur
                                  ? `\u20AC${variant.priceEur.toLocaleString()}`
                                  : '\u2014'}
                              </TableCell>
                              <TableCell className="text-right">
                                {variant.batteryKwh
                                  ? `${variant.batteryKwh} kWh`
                                  : '\u2014'}
                              </TableCell>
                              <TableCell className="text-right">
                                {variant.rangeWltpKm
                                  ? `${variant.rangeWltpKm} km`
                                  : '\u2014'}
                              </TableCell>
                              <TableCell className="text-right">
                                {variant.powerHp
                                  ? `${variant.powerHp} hp`
                                  : '\u2014'}
                              </TableCell>
                              <TableCell className="text-center">
                                {variant.driveType || '\u2014'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            )}

            {/* Description + Highlights */}
            {(description || (highlights && highlights.length > 0)) && (
              <section className="space-y-6">
                {description && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">{t('about')}</h2>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {description}
                      </p>
                    </div>
                  </div>
                )}

                {highlights && highlights.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">{t('highlights')}</h2>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {highlights.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 rounded-xl bg-white border border-slate-100 p-3"
                        >
                          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                          <span className="text-sm text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Specs Accordion */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {t('performanceSpecs').replace(/specs?/i, '').trim() || 'Specifications'}
              </h2>
              <SpecsAccordion categories={specCategories} />
            </section>

            {/* Video */}
            {model.videoUrl && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">{t('video')}</h2>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                  <iframe
                    src={model.videoUrl}
                    title={`${fullName} video`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {/* Available Markets grid */}
            {model.markets && model.markets.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-slate-400" />
                  {t('availableMarkets')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {model.markets.map((market) => (
                    <Badge
                      key={market}
                      variant="outline"
                      className="rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      {market}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ─── Sidebar ───────────────────────────────────────────────── */}
          <div className="lg:relative">
            <div className="lg:sticky lg:top-6">
              <MarketSidebar
                brandName={model.brand.name}
                modelName={model.name}
                priceEurFrom={model.priceEurFrom}
                ncapStars={model.ncapStars}
                markets={model.markets}
                year={model.year}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
