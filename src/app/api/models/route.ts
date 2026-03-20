import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { models, brands } from '@/db/schema';
import { eq, and, gte, lte, ilike, inArray, sql, asc, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    // Filters
    const brand = searchParams.get('brand');
    const propulsion = searchParams.get('propulsion');
    const segment = searchParams.get('segment');
    const driveType = searchParams.get('driveType');
    const search = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRange = searchParams.get('minRange');
    const featured = searchParams.get('featured');
    const year = searchParams.get('year');

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'sortOrder';
    const sortDir = searchParams.get('sortDir') === 'desc' ? 'desc' : 'asc';

    // Build conditions (only published models for public API)
    const conditions = [eq(models.isPublished, true)];

    if (brand) {
      const brandRecord = await db.query.brands.findFirst({
        where: eq(brands.slug, brand),
      });
      if (brandRecord) {
        conditions.push(eq(models.brandId, brandRecord.id));
      } else {
        return NextResponse.json({ data: [], total: 0, page, limit });
      }
    }

    if (propulsion) {
      const types = propulsion.split(',').map((s) => s.trim().toUpperCase());
      conditions.push(inArray(models.propulsion, types));
    }

    if (segment) {
      const segments = segment.split(',').map((s) => s.trim().toLowerCase());
      conditions.push(inArray(models.segment, segments));
    }

    if (driveType) {
      const drives = driveType.split(',').map((s) => s.trim().toUpperCase());
      conditions.push(inArray(models.driveType, drives));
    }

    if (search) {
      conditions.push(ilike(models.name, `%${search}%`));
    }

    if (minPrice) {
      conditions.push(gte(models.priceEurFrom, parseInt(minPrice, 10)));
    }

    if (maxPrice) {
      conditions.push(lte(models.priceEurFrom, parseInt(maxPrice, 10)));
    }

    if (minRange) {
      conditions.push(gte(models.rangeWltpKm, parseInt(minRange, 10)));
    }

    if (featured === 'true') {
      conditions.push(eq(models.isFeatured, true));
    }

    if (year) {
      conditions.push(eq(models.year, parseInt(year, 10)));
    }

    const whereClause = and(...conditions);

    // Sort mapping
    const sortColumn = (() => {
      switch (sortBy) {
        case 'name': return models.name;
        case 'price': return models.priceEurFrom;
        case 'range': return models.rangeWltpKm;
        case 'year': return models.year;
        case 'power': return models.powerHp;
        default: return models.sortOrder;
      }
    })();

    const orderFn = sortDir === 'desc' ? desc : asc;

    const [data, [{ total }]] = await Promise.all([
      db
        .select({
          id: models.id,
          name: models.name,
          slug: models.slug,
          brandId: models.brandId,
          brandName: brands.name,
          brandSlug: brands.slug,
          propulsion: models.propulsion,
          segment: models.segment,
          year: models.year,
          priceEurFrom: models.priceEurFrom,
          priceEurTo: models.priceEurTo,
          batteryKwh: models.batteryKwh,
          rangeWltpKm: models.rangeWltpKm,
          powerHp: models.powerHp,
          topSpeedKmh: models.topSpeedKmh,
          acceleration0100: models.acceleration0100,
          driveType: models.driveType,
          seats: models.seats,
          isFeatured: models.isFeatured,
        })
        .from(models)
        .leftJoin(brands, eq(models.brandId, brands.id))
        .where(whereClause)
        .orderBy(orderFn(sortColumn!))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(models)
        .where(whereClause),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('GET /api/models error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
