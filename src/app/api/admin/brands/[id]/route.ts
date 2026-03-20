import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { brands, models } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const brandUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  logoUrl: z.string().url().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  descriptionRo: z.string().nullable().optional(),
  foundedYear: z.number().int().min(1800).max(2100).nullable().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const brandId = parseInt(id, 10);
    if (isNaN(brandId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = brandUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(brands)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(brands.id, brandId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'A brand with this slug already exists' }, { status: 409 });
    }
    console.error('PUT /api/admin/brands/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const brandId = parseInt(id, 10);
    if (isNaN(brandId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Check if brand has models
    const [modelCount] = await db
      .select({ value: count() })
      .from(models)
      .where(eq(models.brandId, brandId));

    if (modelCount.value > 0) {
      return NextResponse.json(
        { error: `Cannot delete brand: it has ${modelCount.value} model(s). Delete models first.` },
        { status: 409 }
      );
    }

    const [deleted] = await db
      .delete(brands)
      .where(eq(brands.id, brandId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/brands/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
