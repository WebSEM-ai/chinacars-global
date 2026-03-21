import postgres from 'postgres';
import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = postgres(process.env.DATABASE_URL);

async function importVehicle(data) {
  const warnings = [];
  const identity = data.identity;
  const battery = data.battery || {};
  const motor = data.motor || {};
  const charging = data.charging || {};
  const dimensions = data.dimensions || {};
  const safety = data.safety || {};
  const markets = data.markets || {};
  const content = data.content || {};
  const meta = data.meta || {};
  const warranty = data.warranty || {};

  const brandSlug = identity.brand_slug || identity.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // 1. Find or create brand
  let [brand] = await sql`SELECT * FROM brands WHERE slug = ${brandSlug}`;
  if (!brand) {
    [brand] = await sql`
      INSERT INTO brands (slug, name, is_published)
      VALUES (${brandSlug}, ${identity.brand}, true)
      RETURNING *`;
    warnings.push(`Created new brand: ${identity.brand}`);
  }

  // 2. Get base/top variant info
  const baseVariant = data.variants?.find(v => v.is_base_variant) || data.variants?.[0] || {};
  const euPricing = markets.pricing?.find(p => p.currency === 'EUR');
  const enContent = content.translations?.en || {};
  const roContent = content.translations?.ro || {};
  const propulsion = meta.powertrain_type || 'BEV';

  // 3. Check existing model
  const [existing] = await sql`SELECT id FROM models WHERE slug = ${identity.model_slug}`;

  const modelData = {
    brand_id: brand.id,
    slug: identity.model_slug,
    name: identity.model_name,
    propulsion,
    segment: identity.body_type || null,
    year: identity.year_introduced || null,
    price_eur_from: euPricing?.price_base || null,
    price_eur_to: euPricing?.price_top || null,
    battery_kwh: battery.capacity_kwh_usable?.toString() || baseVariant.battery_capacity_kwh?.toString() || null,
    range_wltp_km: baseVariant.range_wltp_km || null,
    power_kw: motor.max_power_kw || baseVariant.motor_power_kw || null,
    power_hp: motor.max_power_hp || baseVariant.motor_power_hp || null,
    torque_nm: motor.max_torque_nm || null,
    top_speed_kmh: motor.top_speed_kmh || null,
    acceleration_0_100: (motor.acceleration_0_100_sec || baseVariant.acceleration_0_100_sec)?.toString() || null,
    length_mm: dimensions.length_mm || null,
    width_mm: dimensions.width_mm || null,
    height_mm: dimensions.height_mm || null,
    wheelbase_mm: dimensions.wheelbase_mm || null,
    trunk_liters: dimensions.trunk_volume_liters || null,
    seats: identity.number_of_seats || null,
    drive_type: motor.drivetrain_base || baseVariant.drivetrain || null,
    charge_time_dc_min: charging.dc_charging_time_10_80_min || null,
    charge_power_dc_kw: charging.dc_max_kw?.toString() || null,
    charge_power_ac_kw: charging.ac_max_kw?.toString() || null,
    ncap_stars: safety.euro_ncap?.stars || null,
    eu_homologated: markets.eu_type_approval || false,
    service_europe: false,
    warranty_years: warranty.vehicle_years || null,
    warranty_km: warranty.vehicle_km || null,
    description_en: enContent.description_long || enContent.description_short || null,
    description_ro: roContent.description_long || roContent.description_short || null,
    highlights_en: enContent.key_selling_points ? JSON.stringify(enContent.key_selling_points) : null,
    highlights_ro: roContent.key_selling_points ? JSON.stringify(roContent.key_selling_points) : null,
    markets: markets.available_in || null,
    full_spec: JSON.stringify(data),
    is_published: meta.status === 'published',
    is_featured: false,
    sort_order: 0,
  };

  let modelId;
  if (existing) {
    await sql`
      UPDATE models SET
        brand_id = ${modelData.brand_id},
        name = ${modelData.name},
        propulsion = ${modelData.propulsion},
        segment = ${modelData.segment},
        year = ${modelData.year},
        price_eur_from = ${modelData.price_eur_from},
        price_eur_to = ${modelData.price_eur_to},
        battery_kwh = ${modelData.battery_kwh},
        range_wltp_km = ${modelData.range_wltp_km},
        power_kw = ${modelData.power_kw},
        power_hp = ${modelData.power_hp},
        torque_nm = ${modelData.torque_nm},
        top_speed_kmh = ${modelData.top_speed_kmh},
        acceleration_0_100 = ${modelData.acceleration_0_100},
        length_mm = ${modelData.length_mm},
        width_mm = ${modelData.width_mm},
        height_mm = ${modelData.height_mm},
        wheelbase_mm = ${modelData.wheelbase_mm},
        trunk_liters = ${modelData.trunk_liters},
        seats = ${modelData.seats},
        drive_type = ${modelData.drive_type},
        charge_time_dc_min = ${modelData.charge_time_dc_min},
        charge_power_dc_kw = ${modelData.charge_power_dc_kw},
        charge_power_ac_kw = ${modelData.charge_power_ac_kw},
        ncap_stars = ${modelData.ncap_stars},
        eu_homologated = ${modelData.eu_homologated},
        warranty_years = ${modelData.warranty_years},
        warranty_km = ${modelData.warranty_km},
        description_en = ${modelData.description_en},
        description_ro = ${modelData.description_ro},
        highlights_en = ${modelData.highlights_en},
        highlights_ro = ${modelData.highlights_ro},
        markets = ${modelData.markets},
        full_spec = ${modelData.full_spec},
        is_published = ${modelData.is_published},
        updated_at = NOW()
      WHERE id = ${existing.id}`;
    modelId = existing.id;
    warnings.push(`Updated existing model (id: ${modelId})`);

    // Delete old variants and images for re-import
    await sql`DELETE FROM model_variants WHERE model_id = ${modelId}`;
    await sql`DELETE FROM images WHERE model_id = ${modelId}`;
  } else {
    const [newModel] = await sql`
      INSERT INTO models (brand_id, slug, name, propulsion, segment, year,
        price_eur_from, price_eur_to, battery_kwh, range_wltp_km,
        power_kw, power_hp, torque_nm, top_speed_kmh, acceleration_0_100,
        length_mm, width_mm, height_mm, wheelbase_mm, trunk_liters, seats,
        drive_type, charge_time_dc_min, charge_power_dc_kw, charge_power_ac_kw,
        ncap_stars, eu_homologated, warranty_years, warranty_km,
        description_en, description_ro, highlights_en, highlights_ro,
        markets, full_spec, is_published, is_featured, sort_order)
      VALUES (
        ${modelData.brand_id}, ${modelData.slug}, ${modelData.name},
        ${modelData.propulsion}, ${modelData.segment}, ${modelData.year},
        ${modelData.price_eur_from}, ${modelData.price_eur_to},
        ${modelData.battery_kwh}, ${modelData.range_wltp_km},
        ${modelData.power_kw}, ${modelData.power_hp},
        ${modelData.torque_nm}, ${modelData.top_speed_kmh},
        ${modelData.acceleration_0_100},
        ${modelData.length_mm}, ${modelData.width_mm},
        ${modelData.height_mm}, ${modelData.wheelbase_mm},
        ${modelData.trunk_liters}, ${modelData.seats},
        ${modelData.drive_type}, ${modelData.charge_time_dc_min},
        ${modelData.charge_power_dc_kw}, ${modelData.charge_power_ac_kw},
        ${modelData.ncap_stars}, ${modelData.eu_homologated},
        ${modelData.warranty_years}, ${modelData.warranty_km},
        ${modelData.description_en}, ${modelData.description_ro},
        ${modelData.highlights_en}, ${modelData.highlights_ro},
        ${modelData.markets}, ${modelData.full_spec},
        ${modelData.is_published}, false, 0)
      RETURNING id`;
    modelId = newModel.id;
  }

  // 4. Import variants
  let variantsCreated = 0;
  if (data.variants && Array.isArray(data.variants)) {
    for (const v of data.variants) {
      await sql`
        INSERT INTO model_variants (model_id, name, battery_kwh, range_wltp_km, power_kw, power_hp, drive_type, sort_order)
        VALUES (${modelId}, ${v.variant_name},
          ${v.battery_capacity_kwh?.toString() || null},
          ${v.range_wltp_km || null},
          ${v.motor_power_kw || null},
          ${v.motor_power_hp || null},
          ${v.drivetrain || null},
          ${v.is_base_variant ? 0 : 2})`;
      variantsCreated++;
    }
  }

  // 5. Import images
  const typeMap = {
    exterior_front: 'hero', exterior_rear: 'gallery', exterior_side: 'gallery',
    exterior_3q_front: 'hero', exterior_3q_rear: 'gallery',
    interior_dashboard: 'interior', interior_seats_front: 'interior',
    interior_seats_rear: 'interior', trunk: 'detail', detail: 'detail',
  };

  if (data.media?.images && Array.isArray(data.media.images)) {
    for (let i = 0; i < data.media.images.length; i++) {
      const img = data.media.images[i];
      const altEn = typeof img.alt === 'object' ? img.alt.en : img.alt || `${identity.brand} ${identity.model_name}`;
      const altRo = typeof img.alt === 'object' ? img.alt.ro : null;
      await sql`
        INSERT INTO images (model_id, url, thumb_url, alt_en, alt_ro, type, sort_order)
        VALUES (${modelId}, ${img.url}, ${img.url}, ${altEn}, ${altRo},
          ${typeMap[img.type] || 'gallery'}, ${i})`;
    }
  }

  // Hero image fallback
  if (data.media?.hero_image_url) {
    const hasHero = data.media?.images?.some(img => img.type === 'exterior_3q_front' || img.type === 'exterior_front');
    if (!hasHero) {
      await sql`
        INSERT INTO images (model_id, url, thumb_url, alt_en, type, sort_order)
        VALUES (${modelId}, ${data.media.hero_image_url}, ${data.media.hero_image_url},
          ${identity.brand + ' ' + identity.model_name}, 'hero', 0)`;
    }
  }

  return { success: true, modelId, brandId: brand.id, variantsCreated, warnings };
}

async function main() {
  const vehiclesDir = join(__dirname, 'data', 'vehicles');
  const files = readdirSync(vehiclesDir).filter(f => f.endsWith('.json'));

  console.log(`Found ${files.length} vehicle JSON files\n`);

  let success = 0;
  let failed = 0;

  for (const file of files.sort()) {
    try {
      const data = JSON.parse(readFileSync(join(vehiclesDir, file), 'utf-8'));
      const result = await importVehicle(data);
      console.log(`✓ ${file} → ${data.identity.brand} ${data.identity.model_name} (id: ${result.modelId}, variants: ${result.variantsCreated})`);
      if (result.warnings.length) {
        result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
      }
      success++;
    } catch (err) {
      console.error(`✗ ${file} → ERROR: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n─── Results ───`);
  console.log(`Total: ${files.length} | Success: ${success} | Failed: ${failed}`);

  // Summary
  const counts = await sql`
    SELECT b.name as brand, COUNT(m.id) as models
    FROM brands b LEFT JOIN models m ON m.brand_id = b.id
    WHERE b.is_published = true
    GROUP BY b.name ORDER BY b.name`;
  console.log(`\nModels per brand:`);
  for (const r of counts) console.log(`  ${r.brand}: ${r.models}`);

  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });
