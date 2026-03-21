import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL);

async function fixImages() {
  // 1. Check current state of images
  const allImages = await sql`SELECT i.id, i.model_id, i.url, i.type, m.slug as model_slug, m.name as model_name
    FROM images i JOIN models m ON i.model_id = m.id ORDER BY m.slug, i.sort_order`;

  console.log(`Found ${allImages.length} images in DB:`);
  for (const img of allImages) {
    console.log(`  [${img.model_slug}] ${img.type} → ${img.url}`);
  }

  // 2. Get BYD Seal model
  const [sealModel] = await sql`SELECT id, slug, name FROM models WHERE slug = 'byd-seal'`;
  if (!sealModel) {
    console.log('BYD Seal model not found!');
    process.exit(1);
  }
  console.log(`\nBYD Seal model id: ${sealModel.id}`);

  // 3. Delete old images for BYD Seal (they point to non-existent CDN)
  await sql`DELETE FROM images WHERE model_id = ${sealModel.id}`;
  console.log('Deleted old BYD Seal images');

  // 4. Insert real local images
  const sealImages = [
    { url: '/images/byd/byd-seal-5-dm-i-driving-01-xl.webp', type: 'hero', altEn: 'BYD Seal driving on road', altRo: 'BYD Seal in mers pe sosea', sortOrder: 0 },
    { url: '/images/byd/Kingbode-BYD-Seal-07-1.jpg', type: 'gallery', altEn: 'BYD Seal exterior view', altRo: 'BYD Seal vedere exterior', sortOrder: 1 },
    { url: '/images/byd/BYD Seal 2023 UK-13.webp', type: 'gallery', altEn: 'BYD Seal 2023 UK edition', altRo: 'BYD Seal 2023 editia UK', sortOrder: 2 },
    { url: '/images/byd/124-byd-seal-review.webp', type: 'gallery', altEn: 'BYD Seal review photo', altRo: 'BYD Seal foto recenzie', sortOrder: 3 },
    { url: '/images/byd/BYD-new-Seal-EV-interior.webp', type: 'interior', altEn: 'BYD Seal interior dashboard', altRo: 'BYD Seal interior bord', sortOrder: 4 },
    { url: '/images/byd/byd-seal-dmi-1.jpg', type: 'gallery', altEn: 'BYD Seal DM-i', altRo: 'BYD Seal DM-i', sortOrder: 5 },
  ];

  for (const img of sealImages) {
    await sql`INSERT INTO images (model_id, url, thumb_url, alt_en, alt_ro, type, sort_order)
      VALUES (${sealModel.id}, ${img.url}, ${img.url}, ${img.altEn}, ${img.altRo}, ${img.type}, ${img.sortOrder})`;
  }
  console.log(`Inserted ${sealImages.length} local images for BYD Seal`);

  // 5. Also fix images for BYD Seal 5 DM-i if it exists (using the sealion5 images in /images/)
  const [seal5Model] = await sql`SELECT id, slug FROM models WHERE slug LIKE '%seal%5%' OR slug LIKE '%sealion%' LIMIT 1`;
  if (seal5Model) {
    await sql`DELETE FROM images WHERE model_id = ${seal5Model.id}`;
    const seal5Images = [
      { url: '/images/byd-seal-5-dm-i-1stBanner-xl.webp', type: 'hero', altEn: 'BYD Seal 5 DM-i hero', sortOrder: 0 },
      { url: '/images/byd-sealion5-dmi-exterior-01-l.webp', type: 'gallery', altEn: 'BYD Sealion 5 exterior', sortOrder: 1 },
      { url: '/images/byd-sealion5-dmi-exterior-02-l.webp', type: 'gallery', altEn: 'BYD Sealion 5 exterior rear', sortOrder: 2 },
      { url: '/images/byd-sealion5-dmi-interior-01-l.webp', type: 'interior', altEn: 'BYD Sealion 5 interior', sortOrder: 3 },
      { url: '/images/byd-sealion5-dmi-interior-02-l.webp', type: 'interior', altEn: 'BYD Sealion 5 dashboard', sortOrder: 4 },
      { url: '/images/byd-sealion5-dmi-performance-01-l.webp', type: 'detail', altEn: 'BYD Sealion 5 performance', sortOrder: 5 },
      { url: '/images/byd-sealion5-dmi-safety-01-l.webp', type: 'detail', altEn: 'BYD Sealion 5 safety', sortOrder: 6 },
    ];
    for (const img of seal5Images) {
      await sql`INSERT INTO images (model_id, url, thumb_url, alt_en, type, sort_order)
        VALUES (${seal5Model.id}, ${img.url}, ${img.url}, ${img.altEn}, ${img.type}, ${img.sortOrder})`;
    }
    console.log(`Inserted ${seal5Images.length} images for ${seal5Model.slug}`);
  }

  // 6. Check all models that have 0 images (seeded models from seed.ts)
  const modelsWithoutImages = await sql`
    SELECT m.id, m.slug, m.name, b.slug as brand_slug
    FROM models m JOIN brands b ON m.brand_id = b.id
    WHERE m.id NOT IN (SELECT DISTINCT model_id FROM images)
    ORDER BY m.slug`;

  if (modelsWithoutImages.length > 0) {
    console.log(`\nModels without images:`);
    for (const m of modelsWithoutImages) {
      console.log(`  - ${m.brand_slug}/${m.slug} (${m.name})`);
    }
  }

  console.log('\nDone!');
  await sql.end();
}

fixImages().catch(err => {
  console.error(err);
  process.exit(1);
});
