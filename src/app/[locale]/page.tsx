import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { db } from '@/db';
import { brands, models, images } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ModelCard } from '@/components/catalog/ModelCard';
import { BrandCard } from '@/components/catalog/BrandCard';
import { Badge } from '@/components/ui/badge';
import {
  Car,
  Globe,
  Building2,
  Zap,
  ArrowRight,
  Shield,
  Battery,
  TrendingUp,
  Award,
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', ro: '/ro' },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Query featured models with their brand and hero image
  const featuredModels = await db.query.models.findMany({
    where: eq(models.isFeatured, true),
    with: {
      brand: true,
      images: true,
    },
    orderBy: [desc(models.sortOrder)],
    limit: 6,
  });

  // Query all published brands with model counts
  const publishedBrands = await db.query.brands.findMany({
    where: eq(brands.isPublished, true),
    with: {
      models: {
        where: eq(models.isPublished, true),
      },
    },
    orderBy: [desc(brands.sortOrder)],
  });

  const stats = [
    {
      icon: Car,
      value: '7M+',
      label: t('statsVehiclesExported'),
    },
    {
      icon: Building2,
      value: '30+',
      label: t('statsBrands'),
    },
    {
      icon: Globe,
      value: '100+',
      label: t('statsMarkets'),
    },
    {
      icon: Zap,
      value: '35%',
      label: t('statsEvShare'),
    },
  ];

  return (
    <div>
      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 text-sm px-4 py-1.5 bg-white/10 text-white border-white/20 hover:bg-white/15"
            >
              {t('heroBadge')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t('heroTitle')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300 sm:text-xl">
              {t('heroSubtitle')}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/brands" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-9 px-8 text-base font-medium transition-colors hover:bg-primary/80">
                {t('heroCta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center justify-center rounded-lg h-9 px-8 text-base font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
              >
                {t('heroCtaCompare')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─────────────────────────────────────────────── */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-8 w-8 text-primary mb-3" />
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Models ───────────────────────────────────────────── */}
      {featuredModels.length > 0 && (
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {t('featuredTitle')}
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  {t('featuredSubtitle')}
                </p>
              </div>
              <Link href="/search" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {tCommon('viewAll')}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredModels.map((model) => {
                const heroImage = model.images.find((img) => img.type === 'hero') || model.images[0];
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

            <div className="mt-8 text-center sm:hidden">
              <Link href="/search" className="inline-flex items-center justify-center rounded-lg border border-border bg-background h-8 px-2.5 text-sm font-medium hover:bg-muted transition-colors">
                {tCommon('viewAll')}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Brands Grid ───────────────────────────────────────────────── */}
      {publishedBrands.length > 0 && (
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {t('brandsTitle')}
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  {t('brandsSubtitle')}
                </p>
              </div>
              <Link href="/brands" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {tCommon('viewAll')}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {publishedBrands.map((brand) => (
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
          </div>
        </section>
      )}

      {/* ─── Why Chinese Cars? ─────────────────────────────────────────── */}
      <section className="bg-slate-50 border-t">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              {t('whyTitle')}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('whySubtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('whyInnovation')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('whyInnovationDesc')}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Battery className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('whyEv')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('whyEvDesc')}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('whyValue')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('whyValueDesc')}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('whySafety')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('whySafetyDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
