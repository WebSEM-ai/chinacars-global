import { db } from '@/db';
import { brands, models, modelVariants, images } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface ImportResult {
  success: boolean;
  modelId?: number;
  brandId?: number;
  variantsCreated?: number;
  errors: string[];
  warnings: string[];
}

export async function importVehicleJson(data: any): Promise<ImportResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required top-level sections
  if (!data.identity) errors.push('Missing required section: identity');
  if (!data.identity?.brand) errors.push('Missing required field: identity.brand');
  if (!data.identity?.model_name) errors.push('Missing required field: identity.model_name');
  if (!data.identity?.model_slug) errors.push('Missing required field: identity.model_slug');

  if (errors.length > 0) return { success: false, errors, warnings };

  const identity = data.identity;
  const battery = data.battery || {};
  const motor = data.motor || {};
  const charging = data.charging || {};
  const dimensions = data.dimensions || {};
  const safety = data.safety || {};
  const markets = data.markets || {};
  const content = data.content || {};
  const meta = data.meta || {};
  const warranty = data.warranty || battery; // fallback to battery warranty

  // 1. Find or create brand
  const brandSlug = identity.brand_slug || identity.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let brand = await db.query.brands.findFirst({
    where: eq(brands.slug, brandSlug),
  });

  if (!brand) {
    const [newBrand] = await db.insert(brands).values({
      slug: brandSlug,
      name: identity.brand,
      isPublished: true,
    }).returning();
    brand = newBrand;
    warnings.push(`Created new brand: ${identity.brand}`);
  }

  // 2. Check if model already exists
  const existingModel = await db.query.models.findFirst({
    where: eq(models.slug, identity.model_slug),
  });

  // 3. Map flat fields for SQL filtering
  // Get base variant data for the main model record
  const baseVariant = data.variants?.find((v: any) => v.is_base_variant) || data.variants?.[0] || {};
  const topVariant = data.variants?.reduce((top: any, v: any) => {
    if (!top || (v.motor_power_kw || 0) > (top.motor_power_kw || 0)) return v;
    return top;
  }, null) || baseVariant;

  // Get EU pricing
  const euPricing = markets.pricing?.find((p: any) => p.currency === 'EUR');
  const usdPricing = markets.pricing?.find((p: any) => p.currency === 'USD');

  // Get translations for EN/RO
  const enContent = content.translations?.en || {};
  const roContent = content.translations?.ro || {};

  // Build highlights arrays from key_selling_points
  const highlightsEn = enContent.key_selling_points || null;
  const highlightsRo = roContent.key_selling_points || null;

  // Determine propulsion mapping
  const propulsion = meta.powertrain_type || 'BEV';

  // Map body_type to our segment field
  const segment = identity.body_type || null;

  const modelData = {
    brandId: brand.id,
    slug: identity.model_slug,
    name: identity.model_name,
    propulsion,
    segment,
    year: identity.year_introduced || null,
    priceEurFrom: euPricing?.price_base || null,
    priceEurTo: euPricing?.price_top || null,
    priceUsdFrom: usdPricing?.price_base || null,
    priceUsdTo: usdPricing?.price_top || null,
    batteryKwh: battery.capacity_kwh_usable?.toString() || baseVariant.battery_capacity_kwh?.toString() || null,
    rangeWltpKm: baseVariant.range_wltp_km || data.range_efficiency?.range_wltp_km_base || null,
    powerKw: motor.max_power_kw || baseVariant.motor_power_kw || null,
    powerHp: motor.max_power_hp || baseVariant.motor_power_hp || null,
    torqueNm: motor.max_torque_nm || baseVariant.torque_nm || null,
    topSpeedKmh: motor.top_speed_kmh || baseVariant.top_speed_kmh || null,
    acceleration0100: (motor.acceleration_0_100_sec || baseVariant.acceleration_0_100_sec)?.toString() || null,
    lengthMm: dimensions.length_mm || null,
    widthMm: dimensions.width_mm || null,
    heightMm: dimensions.height_mm || null,
    wheelbaseMm: dimensions.wheelbase_mm || null,
    trunkLiters: dimensions.trunk_volume_liters || null,
    seats: identity.number_of_seats || null,
    driveType: motor.drivetrain_base || baseVariant.drivetrain || null,
    chargeTimeDcMin: charging.dc_charging_time_10_80_min || null,
    chargePowerDcKw: charging.dc_max_kw?.toString() || null,
    chargePowerAcKw: charging.ac_max_kw?.toString() || null,
    ncapStars: safety.euro_ncap?.stars || null,
    euHomologated: markets.eu_type_approval || false,
    euTariffPct: markets.import_tariff_eu_percent?.toString() || null,
    serviceEurope: (markets.service_network?.length || 0) > 0,
    warrantyYears: warranty.vehicle_years || battery.warranty_years || null,
    warrantyKm: warranty.vehicle_km || battery.warranty_km || null,
    descriptionEn: enContent.description_long || enContent.description_short || null,
    descriptionRo: roContent.description_long || roContent.description_short || null,
    highlightsEn: highlightsEn as any,
    highlightsRo: highlightsRo as any,
    videoUrl: data.media?.video_urls?.[0]?.url || null,
    markets: markets.available_in || null,
    fullSpec: data, // Store the COMPLETE JSON
    isPublished: meta.status === 'published',
    isFeatured: false,
    sortOrder: 0,
  };

  let modelId: number;

  if (existingModel) {
    // Update existing model
    await db.update(models).set(modelData).where(eq(models.id, existingModel.id));
    modelId = existingModel.id;
    warnings.push(`Updated existing model: ${identity.model_name} (id: ${modelId})`);

    // Delete old variants for re-import
    await db.delete(modelVariants).where(eq(modelVariants.modelId, modelId));
  } else {
    // Insert new model
    const [newModel] = await db.insert(models).values(modelData).returning();
    modelId = newModel.id;
  }

  // 4. Import variants
  let variantsCreated = 0;
  if (data.variants && Array.isArray(data.variants)) {
    for (const v of data.variants) {
      await db.insert(modelVariants).values({
        modelId,
        name: v.variant_name,
        priceEur: null, // Could map from per-variant pricing if available
        priceUsd: null,
        batteryKwh: v.battery_capacity_kwh?.toString() || null,
        rangeWltpKm: v.range_wltp_km || null,
        powerKw: v.motor_power_kw || null,
        powerHp: v.motor_power_hp || null,
        driveType: v.drivetrain || null,
        sortOrder: v.is_base_variant ? 0 : v.is_featured ? 1 : 2,
      });
      variantsCreated++;
    }
  }

  // 5. Import images (if URLs are provided)
  if (data.media?.images && Array.isArray(data.media.images)) {
    // Delete old images for re-import
    if (existingModel) {
      await db.delete(images).where(eq(images.modelId, modelId));
    }

    for (let i = 0; i < data.media.images.length; i++) {
      const img = data.media.images[i];
      // Map detailed types to our simpler type system
      const typeMap: Record<string, string> = {
        exterior_front: 'hero',
        exterior_rear: 'gallery',
        exterior_side: 'gallery',
        exterior_3q_front: 'hero',
        exterior_3q_rear: 'gallery',
        interior_dashboard: 'interior',
        interior_seats_front: 'interior',
        interior_seats_rear: 'interior',
        trunk: 'detail',
        frunk: 'detail',
        charging_port: 'detail',
        detail: 'detail',
      };

      await db.insert(images).values({
        modelId,
        url: img.url,
        thumbUrl: img.url,
        altEn: typeof img.alt === 'object' ? img.alt.en : img.alt || `${identity.brand} ${identity.model_name}`,
        altRo: typeof img.alt === 'object' ? img.alt.ro : null,
        type: typeMap[img.type] || 'gallery',
        sortOrder: i,
      });
    }
  }

  // Also import hero image if specified separately
  if (data.media?.hero_image_url) {
    const existingHero = data.media?.images?.some((img: any) => img.type === 'exterior_3q_front' || img.type === 'exterior_front');
    if (!existingHero) {
      await db.insert(images).values({
        modelId,
        url: data.media.hero_image_url,
        thumbUrl: data.media.hero_image_url,
        altEn: `${identity.brand} ${identity.model_name}`,
        type: 'hero',
        sortOrder: 0,
      });
    }
  }

  return {
    success: true,
    modelId,
    brandId: brand.id,
    variantsCreated,
    errors,
    warnings,
  };
}

// Batch import multiple vehicles
export async function importVehicleBatch(vehicles: any[]): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: ImportResult[];
}> {
  const results: ImportResult[] = [];
  let successful = 0;
  let failed = 0;

  for (const vehicle of vehicles) {
    try {
      const result = await importVehicleJson(vehicle);
      results.push(result);
      if (result.success) successful++;
      else failed++;
    } catch (error: any) {
      results.push({
        success: false,
        errors: [error.message || 'Unknown error'],
        warnings: [],
      });
      failed++;
    }
  }

  return { total: vehicles.length, successful, failed, results };
}
