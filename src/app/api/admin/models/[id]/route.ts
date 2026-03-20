import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { models, images, modelVariants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const modelUpdateSchema = z.object({
  brandId: z.number().int().min(1).optional(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  propulsion: z.string().nullable().optional(),
  segment: z.string().nullable().optional(),
  year: z.number().int().nullable().optional(),
  priceEurFrom: z.number().int().nullable().optional(),
  priceEurTo: z.number().int().nullable().optional(),
  priceUsdFrom: z.number().int().nullable().optional(),
  priceUsdTo: z.number().int().nullable().optional(),
  batteryKwh: z.string().nullable().optional(),
  rangeWltpKm: z.number().int().nullable().optional(),
  powerKw: z.number().int().nullable().optional(),
  powerHp: z.number().int().nullable().optional(),
  torqueNm: z.number().int().nullable().optional(),
  topSpeedKmh: z.number().int().nullable().optional(),
  acceleration0100: z.string().nullable().optional(),
  lengthMm: z.number().int().nullable().optional(),
  widthMm: z.number().int().nullable().optional(),
  heightMm: z.number().int().nullable().optional(),
  wheelbaseMm: z.number().int().nullable().optional(),
  trunkLiters: z.number().int().nullable().optional(),
  seats: z.number().int().nullable().optional(),
  driveType: z.string().nullable().optional(),
  chargeTimeDcMin: z.number().int().nullable().optional(),
  chargePowerDcKw: z.string().nullable().optional(),
  chargePowerAcKw: z.string().nullable().optional(),
  ncapStars: z.number().int().min(0).max(5).nullable().optional(),
  euHomologated: z.boolean().optional(),
  euTariffPct: z.string().nullable().optional(),
  serviceEurope: z.boolean().optional(),
  warrantyYears: z.number().int().nullable().optional(),
  warrantyKm: z.number().int().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  descriptionRo: z.string().nullable().optional(),
  highlightsEn: z.array(z.string()).nullable().optional(),
  highlightsRo: z.array(z.string()).nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  markets: z.array(z.string()).nullable().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
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
    const modelId = parseInt(id, 10);
    if (isNaN(modelId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = modelUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(models)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(models.id, modelId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'A model with this slug already exists' }, { status: 409 });
    }
    console.error('PUT /api/admin/models/[id] error:', error);
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
    const modelId = parseInt(id, 10);
    if (isNaN(modelId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Delete related images and variants first
    await db.delete(images).where(eq(images.modelId, modelId));
    await db.delete(modelVariants).where(eq(modelVariants.modelId, modelId));

    const [deleted] = await db
      .delete(models)
      .where(eq(models.id, modelId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/models/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
