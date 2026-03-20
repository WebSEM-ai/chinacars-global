import { MetadataRoute } from 'next';
import { db } from '@/db';
import { brands, models } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { locales } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chinacars.global';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = ['', '/brands', '/compare', '/search'];
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}${page}`])
          ),
        },
      });
    }
  }

  // Brand pages
  const allBrands = await db
    .select({ slug: brands.slug, updatedAt: brands.updatedAt })
    .from(brands)
    .where(eq(brands.isPublished, true));

  for (const brand of allBrands) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/brands/${brand.slug}`,
        lastModified: brand.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/brands/${brand.slug}`])
          ),
        },
      });
    }
  }

  // Model pages (highest SEO value)
  const allModels = await db
    .select({
      slug: models.slug,
      updatedAt: models.updatedAt,
      brandSlug: brands.slug,
    })
    .from(models)
    .innerJoin(brands, eq(models.brandId, brands.id))
    .where(eq(models.isPublished, true));

  for (const model of allModels) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/brands/${model.brandSlug}/${model.slug}`,
        lastModified: model.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [
              l,
              `${baseUrl}/${l}/brands/${model.brandSlug}/${model.slug}`,
            ])
          ),
        },
      });
    }
  }

  return entries;
}
