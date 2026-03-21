import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  // Get model IDs
  const [tang] = await sql`SELECT id FROM models WHERE slug = 'byd-tang'`;
  const [atto] = await sql`SELECT id FROM models WHERE slug = 'byd-atto-3'`;

  if (!tang) { console.log('BYD Tang not found!'); process.exit(1); }
  if (!atto) { console.log('BYD ATTO 3 not found!'); process.exit(1); }

  console.log(`Tang id: ${tang.id}, ATTO 3 id: ${atto.id}`);

  // Delete any existing images
  await sql`DELETE FROM images WHERE model_id IN (${tang.id}, ${atto.id})`;

  // Tang images
  const tangImages = [
    { url: '/images/tang/byd_tang_2024_1.webp', type: 'hero', altEn: 'BYD Tang 2024 driving', altRo: 'BYD Tang 2024 in mers', sort: 0 },
    { url: '/images/tang/byd_tang_2024_9.webp', type: 'cutout', altEn: 'BYD Tang 2024 white', altRo: 'BYD Tang 2024 alb', sort: 1 },
    { url: '/images/tang/byd_tang_2024_4.webp', type: 'gallery', altEn: 'BYD Tang 2024 front', altRo: 'BYD Tang 2024 fata', sort: 2 },
    { url: '/images/tang/byd_tang_2024_5.webp', type: 'gallery', altEn: 'BYD Tang 2024 rear driving', altRo: 'BYD Tang 2024 spate', sort: 3 },
    { url: '/images/tang/byd_tang_2024_2.webp', type: 'interior', altEn: 'BYD Tang 2024 interior', altRo: 'BYD Tang 2024 interior', sort: 4 },
    { url: '/images/tang/byd_tang_2024_3.webp', type: 'gallery', altEn: 'BYD Tang 2024 3/4 view', altRo: 'BYD Tang 2024 vedere 3/4', sort: 5 },
    { url: '/images/tang/byd_tang_2024_6.webp', type: 'gallery', altEn: 'BYD Tang 2024 side', altRo: 'BYD Tang 2024 lateral', sort: 6 },
    { url: '/images/tang/byd_tang_2024_7.webp', type: 'gallery', altEn: 'BYD Tang 2024 detail', altRo: 'BYD Tang 2024 detaliu', sort: 7 },
    { url: '/images/tang/byd_tang_2024_8.webp', type: 'detail', altEn: 'BYD Tang 2024 rear lights', altRo: 'BYD Tang 2024 stopuri', sort: 8 },
    { url: '/images/tang/byd_tang_2024_10.webp', type: 'gallery', altEn: 'BYD Tang 2024 overview', altRo: 'BYD Tang 2024 prezentare', sort: 9 },
  ];

  // ATTO 3 images
  const attoImages = [
    { url: '/images/atto3/byd-atto-3-2024-5.webp', type: 'hero', altEn: 'BYD ATTO 3 2024 front view', altRo: 'BYD ATTO 3 2024 vedere fata', sort: 0 },
    { url: '/images/atto3/byd-atto-3-2024-3.webp', type: 'cutout', altEn: 'BYD ATTO 3 2024 white', altRo: 'BYD ATTO 3 2024 alb', sort: 1 },
    { url: '/images/atto3/byd-atto-3-2024-9.webp', type: 'gallery', altEn: 'BYD ATTO 3 2024 studio', altRo: 'BYD ATTO 3 2024 studio', sort: 2 },
    { url: '/images/atto3/byd-atto-3-2024-2.webp', type: 'gallery', altEn: 'BYD ATTO 3 2024 rear sunset', altRo: 'BYD ATTO 3 2024 apus', sort: 3 },
    { url: '/images/atto3/byd-atto-3-2024.webp', type: 'interior', altEn: 'BYD ATTO 3 2024 dashboard', altRo: 'BYD ATTO 3 2024 bord', sort: 4 },
    { url: '/images/atto3/byd-atto-3-2024-4.webp', type: 'detail', altEn: 'BYD ATTO 3 2024 rear detail', altRo: 'BYD ATTO 3 2024 detaliu spate', sort: 5 },
    { url: '/images/atto3/byd-atto-3-2024-7.webp', type: 'gallery', altEn: 'BYD ATTO 3 2024 showroom', altRo: 'BYD ATTO 3 2024 showroom', sort: 6 },
    { url: '/images/atto3/byd-atto-3-2024-8.webp', type: 'gallery', altEn: 'BYD ATTO 3 2024 side', altRo: 'BYD ATTO 3 2024 lateral', sort: 7 },
    { url: '/images/atto3/byd-atto-3-2024-6.webp', type: 'gallery', altEn: 'BYD ATTO 3 2024 front', altRo: 'BYD ATTO 3 2024 fata', sort: 8 },
    { url: '/images/atto3/byd-atto-3-2024-10.webp', type: 'gallery', altEn: 'BYD ATTO 3 2024 charging', altRo: 'BYD ATTO 3 2024 incarcare', sort: 9 },
    { url: '/images/atto3/byd-atto-3-2024-11.webp', type: 'gallery', altEn: 'BYD ATTO 3 2024 overview', altRo: 'BYD ATTO 3 2024 prezentare', sort: 10 },
  ];

  for (const img of tangImages) {
    await sql`INSERT INTO images (model_id, url, thumb_url, alt_en, alt_ro, type, sort_order)
      VALUES (${tang.id}, ${img.url}, ${img.url}, ${img.altEn}, ${img.altRo}, ${img.type}, ${img.sort})`;
  }
  console.log(`Inserted ${tangImages.length} Tang images`);

  for (const img of attoImages) {
    await sql`INSERT INTO images (model_id, url, thumb_url, alt_en, alt_ro, type, sort_order)
      VALUES (${atto.id}, ${img.url}, ${img.url}, ${img.altEn}, ${img.altRo}, ${img.type}, ${img.sort})`;
  }
  console.log(`Inserted ${attoImages.length} ATTO 3 images`);

  // Also add a cutout for BYD Seal if not exists (use the byd-seal-u cutout)
  const sealCutout = await sql`SELECT id FROM images WHERE model_id = (SELECT id FROM models WHERE slug = 'byd-seal') AND type = 'cutout'`;
  if (sealCutout.length === 0) {
    const [seal] = await sql`SELECT id FROM models WHERE slug = 'byd-seal'`;
    if (seal) {
      await sql`INSERT INTO images (model_id, url, thumb_url, alt_en, alt_ro, type, sort_order)
        VALUES (${seal.id}, '/images/byd/byd-seal-u-2024-0208.png', '/images/byd/byd-seal-u-2024-0208.png', 'BYD Seal cutout', 'BYD Seal decupat', 'cutout', 10)`;
      console.log('Added Seal cutout image');
    }
  }

  // Verify
  const counts = await sql`SELECT m.name, COUNT(i.id) as cnt FROM models m LEFT JOIN images i ON i.model_id = m.id GROUP BY m.name ORDER BY m.name`;
  console.log('\nImage counts per model:');
  for (const r of counts) console.log(`  ${r.name}: ${r.cnt}`);

  await sql.end();
}

run().catch(e => { console.error(e); process.exit(1); });
