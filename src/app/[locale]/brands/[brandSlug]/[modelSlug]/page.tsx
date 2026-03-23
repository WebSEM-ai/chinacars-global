import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { models, brands } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { computeScores } from '@/lib/compute-score';
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
  Play,
  Sparkles,
  FileText,
  Layers,
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

/* ─── Premium SVG Section Icons ───────────────────────────────────────────── */

function SectionIcon({ type }: { type: 'variants' | 'about' | 'specs' | 'video' | 'markets' }) {
  const cls = "h-5 w-5";
  switch (type) {
    case 'variants':
      return <Layers className={cls} />;
    case 'about':
      return <FileText className={cls} />;
    case 'specs':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6 7h8M6 10h5M6 13h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'video':
      return <Play className={cls} />;
    case 'markets':
      return <Globe className={cls} />;
  }
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
  if (model.brand.slug !== brandSlug) notFound();

  // ─── Compute scores across all published models ────────────────────────
  const allPublishedModels = await db.query.models.findMany({
    where: eq(models.isPublished, true),
  });
  const scoresMap = computeScores(allPublishedModels);
  const modelScore = scoresMap.get(model.id) ?? null;

  // Determine rank (sorted by overall score descending)
  const ranked = [...scoresMap.entries()]
    .sort(([, a], [, b]) => b.overall - a.overall);
  const modelRank = ranked.findIndex(([id]) => id === model.id) + 1;
  const totalModels = ranked.length;

  const description =
    locale === 'ro' ? model.descriptionRo : model.descriptionEn;
  const highlights = (
    locale === 'ro' ? model.highlightsRo : model.highlightsEn
  ) as string[] | null;

  const sortedImages = [...model.images].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  const fullName = `${model.brand.name} ${model.name}`;
  const spec = (model.fullSpec as any) || {};

  // Hero background image
  const heroImage = sortedImages.find((img) => img.type === 'hero') || sortedImages[0];

  // Cutout image for sidebar (white background product shot)
  const cutoutImage = sortedImages.find((img) => img.type === 'cutout');

  // Gallery images — exclude cutout type
  const galleryImages = sortedImages.filter((img) => img.type !== 'cutout');

  // Brand logo path (convention: /images/{brandSlug}/ contains logos)
  const brandSlugLower = model.brand.slug.toLowerCase();

  const breadcrumbItems = [
    { label: tCommon('home'), href: '/' },
    { label: tBrands('title'), href: '/brands' },
    { label: model.brand.name, href: `/brands/${brandSlug}` },
    { label: model.name },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: fullName,
    brand: { '@type': 'Organization', name: model.brand.name },
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
          enginePower: { '@type': 'QuantitativeValue', value: model.powerKw, unitCode: 'KWT' },
          torque: model.torqueNm
            ? { '@type': 'QuantitativeValue', value: model.torqueNm, unitCode: 'NM' }
            : undefined,
        }
      : undefined,
    speed: model.topSpeedKmh
      ? { '@type': 'QuantitativeValue', value: model.topSpeedKmh, unitCode: 'KMH' }
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

  // ─── Spec Categories ─────────────────────────────────────────────────────

  const performanceSpecs = [
    { label: t('powerOutput'), value: model.powerHp, unit: 'hp' },
    { label: t('powerKw'), value: model.powerKw, unit: 'kW' },
    { label: t('torque'), value: model.torqueNm, unit: 'Nm' },
    { label: t('topSpeed'), value: model.topSpeedKmh, unit: 'km/h' },
    { label: t('acceleration'), value: model.acceleration0100 ? `${model.acceleration0100}s` : null },
    { label: t('driveType'), value: model.driveType },
    ...(spec.motor?.configuration ? [{ label: 'Motor Config', value: spec.motor.configuration }] : []),
    ...(spec.motor?.has_torque_vectoring !== undefined ? [{ label: 'Torque Vectoring', value: spec.motor.has_torque_vectoring as boolean }] : []),
  ];

  const batterySpecs = [
    { label: t('batteryCapacity'), value: model.batteryKwh ? `${model.batteryKwh}` : null, unit: 'kWh' },
    { label: t('wltpRange'), value: model.rangeWltpKm, unit: 'km', highlight: true },
    { label: t('dcChargePower'), value: model.chargePowerDcKw ? `${model.chargePowerDcKw}` : null, unit: 'kW' },
    { label: t('acChargePower'), value: model.chargePowerAcKw ? `${model.chargePowerAcKw}` : null, unit: 'kW' },
    { label: t('dcChargeTime'), value: model.chargeTimeDcMin, unit: 'min' },
    ...(spec.battery?.chemistry ? [{ label: 'Battery Chemistry', value: spec.battery.chemistry }] : []),
    ...(spec.battery?.brand_name ? [{ label: 'Battery Brand', value: spec.battery.brand_name }] : []),
    ...(spec.battery?.cell_to_body !== undefined ? [{ label: 'Cell-to-Body', value: spec.battery.cell_to_body as boolean }] : []),
    ...(spec.battery?.thermal_management ? [{ label: 'Thermal Management', value: spec.battery.thermal_management }] : []),
    ...(spec.charging?.connector_eu
      ? [{ label: 'EU Connector (DC)', value: spec.charging.connector_eu.dc },
         { label: 'EU Connector (AC)', value: spec.charging.connector_eu.ac }]
      : []),
    ...(spec.charging?.v2l !== undefined ? [{ label: 'V2L (Vehicle-to-Load)', value: spec.charging.v2l as boolean }] : []),
    ...(spec.charging?.v2g !== undefined ? [{ label: 'V2G (Vehicle-to-Grid)', value: spec.charging.v2g as boolean }] : []),
    ...(spec.charging?.v2h !== undefined ? [{ label: 'V2H (Vehicle-to-Home)', value: spec.charging.v2h as boolean }] : []),
  ];

  const dimensionSpecs = [
    { label: t('length'), value: model.lengthMm, unit: 'mm' },
    { label: t('width'), value: model.widthMm, unit: 'mm' },
    { label: t('height'), value: model.heightMm, unit: 'mm' },
    { label: t('wheelbase'), value: model.wheelbaseMm, unit: 'mm' },
    { label: t('trunkVolume'), value: model.trunkLiters, unit: 'L' },
    { label: t('seats'), value: model.seats },
    ...(spec.frunk ? [{ label: 'Frunk', value: spec.frunk, unit: 'L' }] : []),
    ...(spec.kerb_weight ? [{ label: 'Kerb Weight', value: spec.kerb_weight, unit: 'kg' }] : []),
    ...(spec.gross_weight ? [{ label: 'Gross Weight', value: spec.gross_weight, unit: 'kg' }] : []),
    ...(spec.ground_clearance ? [{ label: 'Ground Clearance', value: spec.ground_clearance, unit: 'mm' }] : []),
    ...(spec.drag_coefficient ? [{ label: 'Drag Coefficient', value: spec.drag_coefficient }] : []),
    ...(spec.turning_circle ? [{ label: 'Turning Circle', value: spec.turning_circle, unit: 'm' }] : []),
  ];

  const safetySpecs = [
    { label: t('ncapRating'), value: model.ncapStars ? `${model.ncapStars} / 5` : null },
    { label: t('euHomologated'), value: model.euHomologated },
    { label: t('euTariff'), value: model.euTariffPct ? `${model.euTariffPct}%` : null },
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
    ...(spec.airbags_count ? [{ label: 'Airbags', value: spec.airbags_count }] : []),
    ...(spec.torsional_stiffness ? [{ label: 'Torsional Stiffness', value: spec.torsional_stiffness, unit: 'Nm/deg' }] : []),
    ...(spec.adas_standard && Array.isArray(spec.adas_standard) ? [{ label: 'ADAS (Standard)', value: spec.adas_standard.join(', ') }] : []),
  ];

  const technologySpecs = [
    ...(spec.infotainment_screen ? [{ label: 'Infotainment Screen', value: spec.infotainment_screen }] : []),
    ...(spec.os ? [{ label: 'Operating System', value: spec.os }] : []),
    ...(spec.ota !== undefined ? [{ label: 'OTA Updates', value: spec.ota as boolean }] : []),
    ...(spec.carplay !== undefined ? [{ label: 'Apple CarPlay', value: spec.carplay as boolean }] : []),
    ...(spec.android_auto !== undefined ? [{ label: 'Android Auto', value: spec.android_auto as boolean }] : []),
    ...(spec.audio ? [{ label: 'Audio System', value: spec.audio }] : []),
    ...(spec.nfc_key !== undefined ? [{ label: 'NFC Key', value: spec.nfc_key as boolean }] : []),
    ...(spec.digital_key !== undefined ? [{ label: 'Digital Key', value: spec.digital_key as boolean }] : []),
    ...(spec.panoramic_roof !== undefined ? [{ label: 'Panoramic Roof', value: spec.panoramic_roof as boolean }] : []),
    ...(spec.autonomous_level ? [{ label: 'Autonomous Level', value: `L${spec.autonomous_level}` }] : []),
  ];

  const comfortSpecs = [
    ...(spec.climate_zones ? [{ label: 'Climate Zones', value: spec.climate_zones }] : []),
    ...(spec.heated_seats !== undefined ? [{ label: 'Heated Seats', value: spec.heated_seats as boolean }] : []),
    ...(spec.ventilated_seats !== undefined ? [{ label: 'Ventilated Seats', value: spec.ventilated_seats as boolean }] : []),
    ...(spec.massage_seats !== undefined ? [{ label: 'Massage Seats', value: spec.massage_seats as boolean }] : []),
    ...(spec.heated_steering !== undefined ? [{ label: 'Heated Steering Wheel', value: spec.heated_steering as boolean }] : []),
  ];

  const specCategories = [
    { id: 'performance', title: t('performanceSpecs'), icon: <Gauge className="h-4 w-4" />, specs: performanceSpecs },
    { id: 'battery', title: t('batteryCharging'), icon: <Battery className="h-4 w-4" />, specs: batterySpecs },
    { id: 'dimensions', title: t('dimensions'), icon: <Ruler className="h-4 w-4" />, specs: dimensionSpecs },
    { id: 'safety', title: t('safetyCompliance'), icon: <Shield className="h-4 w-4" />, specs: safetySpecs },
    ...(technologySpecs.length > 0 ? [{ id: 'technology', title: 'Technology', icon: <Cpu className="h-4 w-4" />, specs: technologySpecs }] : []),
    ...(comfortSpecs.length > 0 ? [{ id: 'comfort', title: 'Comfort', icon: <Sofa className="h-4 w-4" />, specs: comfortSpecs }] : []),
  ];

  const quickSpecs = [
    model.rangeWltpKm ? `${model.rangeWltpKm} km range` : null,
    model.powerHp ? `${model.powerHp} hp` : null,
    model.acceleration0100 ? `${model.acceleration0100}s 0-100` : null,
    model.topSpeedKmh ? `${model.topSpeedKmh} km/h` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={jsonLd} />

      {/* ─── HERO — Cinematic full-width with background image fade ──── */}
      <section className="relative w-full overflow-hidden bg-slate-950 min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]">
        {/* Background image — wider, more cinematic */}
        {heroImage && (
          <div className="absolute inset-0">
            <img
              src={heroImage.url}
              alt=""
              className="w-full h-full object-cover opacity-25 scale-105"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/50" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
          </div>
        )}

        {/* Breadcrumbs over hero */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8 [&_nav]:text-slate-500 [&_a]:text-slate-400 [&_a:hover]:text-white [&_nav_span>.font-medium]:text-slate-300">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-20 lg:pt-14">
          <div className="flex flex-col gap-3 max-w-2xl">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-normal uppercase tracking-[0.3em] text-slate-400">
                {model.brand.name}
              </p>
            </div>

            {/* Model + Year */}
            <div className="flex flex-wrap items-end gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {model.name}
              </h1>
              {model.year && (
                <span className="mb-1 inline-flex items-center rounded-md bg-white/8 px-2.5 py-1 text-xs font-normal text-white/60 ring-1 ring-white/10 sm:mb-2">
                  {model.year}
                </span>
              )}
            </div>

            {/* Price */}
            {model.priceEurFrom && (
              <p className="text-2xl font-bold text-[#E63946] sm:text-3xl">
                {'\u20AC'}{model.priceEurFrom.toLocaleString()}
                {model.priceEurTo && model.priceEurTo !== model.priceEurFrom && (
                  <span className="text-lg font-normal text-[#E63946]/40 sm:text-xl">
                    {' '}&mdash; {'\u20AC'}{model.priceEurTo.toLocaleString()}
                  </span>
                )}
              </p>
            )}

            {/* Quick spec pills — compact */}
            {quickSpecs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {quickSpecs.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1.5 text-xs font-normal text-white/70 ring-1 ring-white/10"
                  >
                    <Zap className="h-3 w-3 text-[#E63946]" />
                    {pill}
                  </span>
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {model.propulsion && (
                <Badge className="bg-[#E63946]/20 text-[#E63946] border-[#E63946]/30 hover:bg-[#E63946]/30 text-[10px] px-2 py-0.5">
                  {model.propulsion}
                </Badge>
              )}
              {model.segment && (
                <Badge variant="outline" className="capitalize border-white/15 text-white/60 text-[10px] px-2 py-0.5">
                  {model.segment}
                </Badge>
              )}
              {model.euHomologated && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 text-[10px] px-2 py-0.5">
                  <Check className="h-2.5 w-2.5 mr-0.5" />
                  EU Homologated
                </Badge>
              )}
              {model.isFeatured && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30 text-[10px] px-2 py-0.5">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content + Sidebar ───────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
          {/* ─── Main Column ───────────────────────────────────────────── */}
          <div className="space-y-0">

            {/* Gallery — White section */}
            {galleryImages.length > 0 && (
              <section className="pb-6">
                <ProductGallery
                  images={galleryImages.map((img) => ({
                    url: img.url,
                    thumbUrl: img.thumbUrl,
                    altEn: img.altEn,
                    altRo: img.altRo,
                    type: img.type,
                  }))}
                  locale={locale}
                />
              </section>
            )}

            {/* Variants — Light gray section */}
            {model.variants.length > 0 && (
              <section className="bg-slate-50 -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 lg:rounded-xl lg:mx-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <SectionIcon type="variants" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">{t('variants')}</h2>
                </div>
                {model.variants.length <= 4 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {model.variants.map((variant) => {
                      const isFeatured =
                        variant.powerHp === model.powerHp &&
                        variant.batteryKwh === model.batteryKwh;
                      return (
                        <div
                          key={variant.id}
                          className={`relative rounded-xl border p-4 transition-shadow hover:shadow-sm ${
                            isFeatured
                              ? 'border-[#E63946]/30 bg-white shadow-sm ring-1 ring-[#E63946]/10'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          {isFeatured && (
                            <span className="absolute -top-2 left-3 rounded bg-[#E63946] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                              Featured
                            </span>
                          )}
                          <h3 className="font-bold text-sm text-slate-900 mb-2">
                            {variant.name}
                          </h3>
                          <div className="space-y-1.5 text-xs">
                            {variant.priceEur && (
                              <div className="flex justify-between">
                                <span className="font-normal text-slate-400">Price</span>
                                <span className="font-bold text-[#E63946]">
                                  {'\u20AC'}{variant.priceEur.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {variant.batteryKwh && (
                              <div className="flex justify-between">
                                <span className="font-normal text-slate-400">Battery</span>
                                <span className="font-bold text-slate-900">{variant.batteryKwh} kWh</span>
                              </div>
                            )}
                            {variant.rangeWltpKm && (
                              <div className="flex justify-between">
                                <span className="font-normal text-slate-400">Range</span>
                                <span className="font-bold text-slate-900">{variant.rangeWltpKm} km</span>
                              </div>
                            )}
                            {variant.powerHp && (
                              <div className="flex justify-between">
                                <span className="font-normal text-slate-400">Power</span>
                                <span className="font-bold text-slate-900">{variant.powerHp} hp</span>
                              </div>
                            )}
                            {variant.driveType && (
                              <div className="flex justify-between">
                                <span className="font-normal text-slate-400">Drive</span>
                                <span className="font-bold text-slate-900">{variant.driveType}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-bold text-xs">{t('variantName')}</TableHead>
                          <TableHead className="text-right font-bold text-xs">{t('priceEur')}</TableHead>
                          <TableHead className="text-right font-bold text-xs">{t('batteryCapacity')}</TableHead>
                          <TableHead className="text-right font-bold text-xs">{t('wltpRange')}</TableHead>
                          <TableHead className="text-right font-bold text-xs">{t('powerOutput')}</TableHead>
                          <TableHead className="text-center font-bold text-xs">{t('driveType')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {model.variants.map((variant) => {
                          const isFeatured =
                            variant.powerHp === model.powerHp &&
                            variant.batteryKwh === model.batteryKwh;
                          return (
                            <TableRow key={variant.id} className={`text-xs ${isFeatured ? 'bg-[#E63946]/5' : ''}`}>
                              <TableCell className="font-semibold">
                                {variant.name}
                                {isFeatured && (
                                  <span className="ml-1.5 inline-flex rounded bg-[#E63946] px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">
                                    Featured
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">{variant.priceEur ? `\u20AC${variant.priceEur.toLocaleString()}` : '\u2014'}</TableCell>
                              <TableCell className="text-right">{variant.batteryKwh ? `${variant.batteryKwh} kWh` : '\u2014'}</TableCell>
                              <TableCell className="text-right">{variant.rangeWltpKm ? `${variant.rangeWltpKm} km` : '\u2014'}</TableCell>
                              <TableCell className="text-right">{variant.powerHp ? `${variant.powerHp} hp` : '\u2014'}</TableCell>
                              <TableCell className="text-center">{variant.driveType || '\u2014'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            )}

            {/* Description + Highlights — White section */}
            {(description || (highlights && highlights.length > 0)) && (
              <section className="py-6">
                {description && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                        <SectionIcon type="about" />
                      </div>
                      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">{t('about')}</h2>
                    </div>
                    <p className="text-sm font-normal text-slate-500 leading-relaxed whitespace-pre-line">
                      {description}
                    </p>
                  </div>
                )}

                {highlights && highlights.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">{t('highlights')}</h2>
                    </div>
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {highlights.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2"
                        >
                          <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                            <Check className="h-2.5 w-2.5 text-emerald-600" />
                          </div>
                          <span className="text-xs font-normal text-slate-600 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Specifications — White section (accordion items go dark when open) */}
            <section className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#E63946] text-white flex items-center justify-center">
                  <SectionIcon type="specs" />
                </div>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  {t('performanceSpecs').replace(/specs?/i, '').trim() || 'Specifications'}
                </h2>
              </div>
              <SpecsAccordion categories={specCategories} />
            </section>

            {/* Video — White section */}
            {model.videoUrl && (
              <section className="py-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <SectionIcon type="video" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">{t('video')}</h2>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
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

            {/* Available Markets — Light gray section */}
            {model.markets && model.markets.length > 0 && (
              <section className="bg-slate-50 -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 lg:rounded-xl lg:mx-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <SectionIcon type="markets" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">{t('availableMarkets')}</h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {model.markets.map((market) => (
                    <Badge
                      key={market}
                      variant="outline"
                      className="rounded-md border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
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
            <div className="lg:sticky lg:top-4">
              <MarketSidebar
                brandName={model.brand.name}
                modelName={model.name}
                priceEurFrom={model.priceEurFrom}
                ncapStars={model.ncapStars}
                markets={model.markets}
                year={model.year}
                cutoutImageUrl={cutoutImage?.url ?? null}
                score={modelScore}
                rank={modelRank || null}
                totalModels={totalModels}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
