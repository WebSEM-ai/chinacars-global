import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { brands, models } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import * as XLSX from 'xlsx';

interface RowError {
  row: number;
  message: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',' || ch === ';') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function parseFileToRows(
  file: File,
  buffer: ArrayBuffer
): { headers: string[]; rows: string[][] } {
  const name = file.name.toLowerCase();

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (data.length < 2) throw new Error('File must have at least a header and one data row');
    const headers = data[0].map(String);
    const rows = data.slice(1).filter((r) => r.some((c) => c != null && String(c).trim()));
    return { headers, rows: rows.map((r) => r.map((c) => String(c ?? ''))) };
  }

  // CSV
  const text = new TextDecoder().decode(buffer);
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error('File must have at least a header and one data row');
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(parseCsvLine);
  return { headers, rows };
}

function toIntOrNull(v: string): number | null {
  if (!v || v.trim() === '') return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function toBoolOrFalse(v: string): boolean {
  const lower = v.toLowerCase().trim();
  return lower === 'true' || lower === '1' || lower === 'yes';
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const columnMapRaw = formData.get('columnMap') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let columnMap: Record<string, string>;
    try {
      columnMap = JSON.parse(columnMapRaw);
    } catch {
      return NextResponse.json({ error: 'Invalid column mapping' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const { headers, rows } = parseFileToRows(file, buffer);

    // Build reverse map: target_field -> file_column_index
    const fieldToIndex: Record<string, number> = {};
    for (const [fileCol, targetField] of Object.entries(columnMap)) {
      const idx = headers.indexOf(fileCol);
      if (idx >= 0) {
        fieldToIndex[targetField] = idx;
      }
    }

    // Cache brand slugs -> ids
    const allBrands = await db.select({ id: brands.id, slug: brands.slug }).from(brands);
    const brandSlugMap = new Map(allBrands.map((b) => [b.slug, b.id]));

    let success = 0;
    const errors: RowError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-based, account for header

      try {
        function getVal(field: string): string {
          const idx = fieldToIndex[field];
          if (idx == null) return '';
          return (row[idx] ?? '').trim();
        }

        const name = getVal('name');
        const slug = getVal('slug');

        if (!name) {
          errors.push({ row: rowNum, message: 'Missing required field: name' });
          continue;
        }

        // Resolve brand
        let brandId: number | null = null;
        const brandSlug = getVal('brand_slug');
        if (brandSlug) {
          brandId = brandSlugMap.get(brandSlug) ?? null;
          if (!brandId) {
            errors.push({ row: rowNum, message: `Brand slug "${brandSlug}" not found` });
            continue;
          }
        } else {
          errors.push({ row: rowNum, message: 'Missing brand_slug' });
          continue;
        }

        const finalSlug =
          slug ||
          name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        await db.insert(models).values({
          brandId,
          name,
          slug: finalSlug,
          propulsion: getVal('propulsion') || null,
          segment: getVal('segment') || null,
          year: toIntOrNull(getVal('year')),
          priceEurFrom: toIntOrNull(getVal('price_eur_from')),
          priceEurTo: toIntOrNull(getVal('price_eur_to')),
          priceUsdFrom: toIntOrNull(getVal('price_usd_from')),
          priceUsdTo: toIntOrNull(getVal('price_usd_to')),
          batteryKwh: getVal('battery_kwh') || null,
          rangeWltpKm: toIntOrNull(getVal('range_wltp_km')),
          powerKw: toIntOrNull(getVal('power_kw')),
          powerHp: toIntOrNull(getVal('power_hp')),
          torqueNm: toIntOrNull(getVal('torque_nm')),
          topSpeedKmh: toIntOrNull(getVal('top_speed_kmh')),
          acceleration0100: getVal('acceleration_0_100') || null,
          lengthMm: toIntOrNull(getVal('length_mm')),
          widthMm: toIntOrNull(getVal('width_mm')),
          heightMm: toIntOrNull(getVal('height_mm')),
          wheelbaseMm: toIntOrNull(getVal('wheelbase_mm')),
          trunkLiters: toIntOrNull(getVal('trunk_liters')),
          seats: toIntOrNull(getVal('seats')),
          driveType: getVal('drive_type') || null,
          chargeTimeDcMin: toIntOrNull(getVal('charge_time_dc_min')),
          chargePowerDcKw: getVal('charge_power_dc_kw') || null,
          chargePowerAcKw: getVal('charge_power_ac_kw') || null,
          ncapStars: toIntOrNull(getVal('ncap_stars')),
          euHomologated: toBoolOrFalse(getVal('eu_homologated')),
          euTariffPct: getVal('eu_tariff_pct') || null,
          serviceEurope: toBoolOrFalse(getVal('service_europe')),
          warrantyYears: toIntOrNull(getVal('warranty_years')),
          warrantyKm: toIntOrNull(getVal('warranty_km')),
          descriptionEn: getVal('description_en') || null,
          videoUrl: getVal('video_url') || null,
          isPublished: toBoolOrFalse(getVal('is_published')),
          isFeatured: toBoolOrFalse(getVal('is_featured')),
        });

        success++;
      } catch (err: any) {
        const msg =
          err?.code === '23505'
            ? 'Duplicate slug'
            : err?.message ?? 'Unknown error';
        errors.push({ row: rowNum, message: msg });
      }
    }

    return NextResponse.json({ success, errors });
  } catch (error: any) {
    console.error('POST /api/admin/import error:', error);
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}
