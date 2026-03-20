import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { db } from '@/db';
import { brands, models } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ModelCard } from '@/components/catalog/ModelCard';
import { BrandCard } from '@/components/catalog/BrandCard';
import { HeroSlider } from '@/components/catalog/HeroSlider';
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
    { icon: Car, value: '7M+', label: t('statsVehiclesExported') },
    { icon: Building2, value: '30+', label: t('statsBrands') },
    { icon: Globe, value: '100+', label: t('statsMarkets') },
    { icon: Zap, value: '35%', label: t('statsEvShare') },
  ];

  return (
    <div>
      {/* ─── Hero Slider ─────────────────────────────────────────── */}
      <HeroSlider
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        searchPlaceholder={t('searchPlaceholder')}
        chipBev={t('chipBev')}
        chipSuv={t('chipSuv')}
        chipUnder30k={t('chipUnder30k')}
      />

      {/* ─── Stats Section ───────────────────────────────────────── */}
      <section className="relative z-10 -mt-12 sm:-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-slate-100 px-6 py-8 sm:py-10">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="mx-auto h-6 w-6 text-[#E63946] mb-2" />
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Models ─────────────────────────────────────── */}
      {featuredModels.length > 0 && (
        <section className="bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  {t('featuredTitle')}
                </h2>
                <p className="mt-2 text-lg text-slate-500">
                  {t('featuredSubtitle')}
                </p>
              </div>
              <Link
                href="/search"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#E63946] hover:text-[#d32f3c] transition-colors"
              >
                {tCommon('viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredModels.map((model) => {
                const heroImage =
                  model.images.find((img) => img.type === 'hero') || model.images[0];
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
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E63946] hover:text-[#d32f3c] transition-colors"
              >
                {tCommon('viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Brands Grid ─────────────────────────────────────────── */}
      {publishedBrands.length > 0 && (
        <section>
          <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  {t('brandsTitle')}
                </h2>
                <p className="mt-2 text-lg text-slate-500">
                  {t('brandsSubtitle')}
                </p>
              </div>
              <Link
                href="/brands"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#E63946] hover:text-[#d32f3c] transition-colors"
              >
                {tCommon('viewAll')}
                <ArrowRight className="h-4 w-4" />
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

      {/* ─── Why Chinese Cars? ───────────────────────────────────── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">
              {t('whyTitle')}
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              {t('whySubtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TrendingUp, title: t('whyInnovation'), desc: t('whyInnovationDesc') },
              { icon: Battery, title: t('whyEv'), desc: t('whyEvDesc') },
              { icon: Award, title: t('whyValue'), desc: t('whyValueDesc') },
              { icon: Shield, title: t('whySafety'), desc: t('whySafetyDesc') },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-[#E63946]/10 flex items-center justify-center mb-5">
                  <item.icon className="h-7 w-7 text-[#E63946]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
