import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL);

const renames = [
  ['/images/byd/BYD Seal 2023 UK-13.webp', '/images/byd/byd-seal-2023-uk-13.webp'],
  ['/images/byd/BYD-new-Seal-EV-interior.webp', '/images/byd/byd-seal-ev-interior.webp'],
  ['/images/byd/Kingbode-BYD-Seal-07-1.jpg', '/images/byd/byd-seal-exterior-07.jpg'],
];

for (const [oldUrl, newUrl] of renames) {
  const r = await sql`UPDATE images SET url = ${newUrl}, thumb_url = ${newUrl} WHERE url = ${oldUrl}`;
  console.log(`${oldUrl} → ${newUrl} (${r.count} rows)`);
}

// Verify
const imgs = await sql`SELECT url, type, sort_order FROM images ORDER BY sort_order`;
console.log('\nCurrent images:');
for (const img of imgs) console.log(`  [${img.type}] ${img.url}`);

await sql.end();
