import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  // Get Chery Tiggo 7 Pro model id
  const [tiggo7] = await sql`SELECT id FROM models WHERE slug = 'chery-tiggo-7-pro'`;

  if (!tiggo7) {
    console.error('Tiggo 7 Pro not found in DB');
    process.exit(1);
  }

  await sql`
    INSERT INTO images (model_id, url, alt_en, alt_ro, type, sort_order)
    VALUES (
      ${tiggo7.id},
      '/images/chery/tiggo-7-pro-press.webp',
      'Chery Tiggo 7 Pro exterior press photo',
      'Chery Tiggo 7 Pro foto exterioara oficiala',
      'hero',
      1
    )
  `;

  console.log(`✓ Tiggo 7 Pro hero image linked (model_id: ${tiggo7.id})`);

  await sql.end();
}

main();
