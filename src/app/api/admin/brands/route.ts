import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { brands, models } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const brandCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  descriptionRo: z.string().nullable().optional(),
  foundedYear: z.number().int().min(1800).max(2100).nullable().optional(),
  isPublished: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        logoUrl: brands.logoUrl,
        websiteUrl: brands.websiteUrl,
        isPublished: brands.isPublished,
        sortOrder: brands.sortOrder,
        createdAt: brands.createdAt,
        modelCount: count(models.id),
      })
      .from(brands)
      .leftJoin(models, eq(models.brandId, brands.id))
      .groupBy(brands.id)
      .orderBy(brands.sortOrder, brands.name);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/admin/brands error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = brandCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [brand] = await db
      .insert(brands)
      .values({
        name: parsed.data.name,
        slug: parsed.data.slug,
        logoUrl: parsed.data.logoUrl ?? null,
        websiteUrl: parsed.data.websiteUrl ?? null,
        descriptionEn: parsed.data.descriptionEn ?? null,
        descriptionRo: parsed.data.descriptionRo ?? null,
        foundedYear: parsed.data.foundedYear ?? null,
        isPublished: parsed.data.isPublished,
        sortOrder: parsed.data.sortOrder,
      })
      .returning();

    return NextResponse.json(brand, { status: 201 });
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'A brand with this slug already exists' }, { status: 409 });
    }
    console.error('POST /api/admin/brands error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
