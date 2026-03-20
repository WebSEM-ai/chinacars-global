import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { models, brands } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const modelCreateSchema = z.object({
  brandId: z.number().int().min(1),
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
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
  euHomologated: z.boolean().optional().default(false),
  euTariffPct: z.string().nullable().optional(),
  serviceEurope: z.boolean().optional().default(false),
  warrantyYears: z.number().int().nullable().optional(),
  warrantyKm: z.number().int().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  descriptionRo: z.string().nullable().optional(),
  highlightsEn: z.array(z.string()).nullable().optional(),
  highlightsRo: z.array(z.string()).nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  markets: z.array(z.string()).nullable().optional(),
  isPublished: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

function cleanIntField(v: any): number | null {
  if (v == null || v === '' || v === 0 || (typeof v === 'number' && isNaN(v))) return null;
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  return isNaN(n) ? null : n;
}

function buildModelValues(data: z.infer<typeof modelCreateSchema>) {
  return {
    brandId: data.brandId,
    name: data.name,
    slug: data.slug,
    propulsion: data.propulsion || null,
    segment: data.segment || null,
    year: cleanIntField(data.year),
    priceEurFrom: cleanIntField(data.priceEurFrom),
    priceEurTo: cleanIntField(data.priceEurTo),
    priceUsdFrom: cleanIntField(data.priceUsdFrom),
    priceUsdTo: cleanIntField(data.priceUsdTo),
    batteryKwh: data.batteryKwh || null,
    rangeWltpKm: cleanIntField(data.rangeWltpKm),
    powerKw: cleanIntField(data.powerKw),
    powerHp: cleanIntField(data.powerHp),
    torqueNm: cleanIntField(data.torqueNm),
    topSpeedKmh: cleanIntField(data.topSpeedKmh),
    acceleration0100: data.acceleration0100 || null,
    lengthMm: cleanIntField(data.lengthMm),
    widthMm: cleanIntField(data.widthMm),
    heightMm: cleanIntField(data.heightMm),
    wheelbaseMm: cleanIntField(data.wheelbaseMm),
    trunkLiters: cleanIntField(data.trunkLiters),
    seats: cleanIntField(data.seats),
    driveType: data.driveType || null,
    chargeTimeDcMin: cleanIntField(data.chargeTimeDcMin),
    chargePowerDcKw: data.chargePowerDcKw || null,
    chargePowerAcKw: data.chargePowerAcKw || null,
    ncapStars: cleanIntField(data.ncapStars),
    euHomologated: data.euHomologated,
    euTariffPct: data.euTariffPct || null,
    serviceEurope: data.serviceEurope,
    warrantyYears: cleanIntField(data.warrantyYears),
    warrantyKm: cleanIntField(data.warrantyKm),
    descriptionEn: data.descriptionEn || null,
    descriptionRo: data.descriptionRo || null,
    highlightsEn: data.highlightsEn ?? null,
    highlightsRo: data.highlightsRo ?? null,
    videoUrl: data.videoUrl || null,
    markets: data.markets ?? null,
    isPublished: data.isPublished,
    isFeatured: data.isFeatured,
    sortOrder: data.sortOrder,
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db
      .select({
        id: models.id,
        name: models.name,
        slug: models.slug,
        brandId: models.brandId,
        brandName: brands.name,
        propulsion: models.propulsion,
        priceEurFrom: models.priceEurFrom,
        year: models.year,
        isPublished: models.isPublished,
        isFeatured: models.isFeatured,
        sortOrder: models.sortOrder,
        createdAt: models.createdAt,
      })
      .from(models)
      .leftJoin(brands, eq(models.brandId, brands.id))
      .orderBy(models.sortOrder, models.name);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/admin/models error:', error);
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
    const parsed = modelCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [model] = await db
      .insert(models)
      .values(buildModelValues(parsed.data))
      .returning();

    return NextResponse.json(model, { status: 201 });
  } catch (error: any) {
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'A model with this slug already exists' }, { status: 409 });
    }
    if (error?.code === '23503') {
      return NextResponse.json({ error: 'Referenced brand does not exist' }, { status: 400 });
    }
    console.error('POST /api/admin/models error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
