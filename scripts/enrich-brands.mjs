import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL);

const brandData = [
  {
    slug: 'mg',
    name: 'MG',
    description_en: 'MG (Morris Garages) is a historic British brand now owned by SAIC Motor. Reborn as an electric-focused manufacturer, MG offers some of Europe\'s most affordable EVs and hybrids with an industry-leading 7-year warranty.',
    description_ro: 'MG (Morris Garages) este un brand britanic istoric, acum deținut de SAIC Motor. Renăscut ca producător axat pe electrificare, MG oferă unele dintre cele mai accesibile EV-uri și hibride din Europa cu o garanție de 7 ani, lider în industrie.',
    website_url: 'https://www.mgmotor.eu',
    founded_year: 1924,
  },
  {
    slug: 'jaecoo',
    name: 'Jaecoo',
    description_en: 'Jaecoo is Chery\'s premium adventure-oriented sub-brand, launching in Europe with rugged, squared-off SUVs featuring advanced PHEV and ICE powertrains. Designed for buyers seeking distinctive styling and off-road capability.',
    description_ro: 'Jaecoo este sub-brandul premium orientat spre aventură al Chery, lansat în Europa cu SUV-uri robuste, cu design pătrat, echipate cu motorizări PHEV și ICE avansate. Conceput pentru cumpărătorii care caută stil distinctiv și capacitate off-road.',
    website_url: 'https://www.jaecoo.com',
    founded_year: 2023,
  },
  {
    slug: 'omoda',
    name: 'Omoda',
    description_en: 'Omoda is Chery\'s youth-oriented brand targeting young, urban buyers with stylish, tech-rich vehicles. Available in both ICE and full-electric variants, Omoda brings fresh design and strong value to the European compact SUV segment.',
    description_ro: 'Omoda este brandul orientat spre tineret al Chery, vizând cumpărătorii tineri și urbani cu vehicule stilate și bogate în tehnologie. Disponibil atât în variante ICE cât și complet electrice, Omoda aduce design proaspăt și valoare excelentă în segmentul SUV compact european.',
    website_url: 'https://www.omoda.com',
    founded_year: 2022,
  },
  {
    slug: 'leapmotor',
    name: 'Leapmotor',
    description_en: 'Leapmotor is a Chinese EV startup distributed in Europe through a joint venture with Stellantis. Known for affordable, tech-forward electric vehicles, Leapmotor leverages Stellantis\'s dealer and service network for European market access.',
    description_ro: 'Leapmotor este un startup chinez de EV-uri distribuit în Europa printr-un joint venture cu Stellantis. Cunoscut pentru vehicule electrice accesibile și avansate tehnologic, Leapmotor valorifică rețeaua de dealeri și service Stellantis pentru acces pe piața europeană.',
    website_url: 'https://www.leapmotor.com',
    founded_year: 2015,
  },
  {
    slug: 'great-wall',
    name: 'Great Wall Motor',
    description_en: 'Great Wall Motor (GWM) is China\'s largest SUV and pickup manufacturer. Its Haval brand is the world\'s best-selling SUV nameplate. GWM brings plug-in hybrid technology and competitive pricing to the European market.',
    description_ro: 'Great Wall Motor (GWM) este cel mai mare producător chinez de SUV-uri și pickup-uri. Brandul său Haval este cel mai bine vândut SUV din lume. GWM aduce tehnologie plug-in hybrid și prețuri competitive pe piața europeană.',
    website_url: 'https://www.gwm-global.com',
    founded_year: 1984,
  },
  {
    slug: 'byd',
    name: 'BYD',
    description_en: 'BYD (Build Your Dreams) is the world\'s largest EV manufacturer and a vertically integrated technology company. From Blade Batteries to DM-i hybrid technology, BYD designs and manufactures its own batteries, chips, and powertrains — delivering exceptional value across its full electric and plug-in hybrid lineup.',
    description_ro: 'BYD (Build Your Dreams) este cel mai mare producător de EV-uri din lume și o companie tehnologică integrată vertical. De la bateriile Blade la tehnologia hybrid DM-i, BYD proiectează și produce propriile baterii, cipuri și motorizări — oferind valoare excepțională în întreaga gamă electrică și plug-in hybrid.',
    website_url: 'https://www.byd.com',
    founded_year: 1995,
  },
];

async function main() {
  for (const brand of brandData) {
    const [existing] = await sql`SELECT id FROM brands WHERE slug = ${brand.slug}`;
    if (existing) {
      await sql`
        UPDATE brands SET
          name = ${brand.name},
          description_en = ${brand.description_en},
          description_ro = ${brand.description_ro},
          website_url = ${brand.website_url},
          founded_year = ${brand.founded_year},
          is_published = true,
          updated_at = NOW()
        WHERE id = ${existing.id}`;
      console.log(`✓ Updated brand: ${brand.name} (id: ${existing.id})`);
    } else {
      const [newBrand] = await sql`
        INSERT INTO brands (slug, name, description_en, description_ro, website_url, founded_year, is_published)
        VALUES (${brand.slug}, ${brand.name}, ${brand.description_en}, ${brand.description_ro},
          ${brand.website_url}, ${brand.founded_year}, true)
        RETURNING id`;
      console.log(`✓ Created brand: ${brand.name} (id: ${newBrand.id})`);
    }
  }

  // Summary
  const brands = await sql`SELECT slug, name, founded_year, description_en IS NOT NULL as has_desc FROM brands WHERE is_published = true ORDER BY name`;
  console.log(`\nAll published brands:`);
  for (const b of brands) {
    console.log(`  ${b.name} (${b.slug}) — founded ${b.founded_year || '?'} — desc: ${b.has_desc ? 'yes' : 'no'}`);
  }

  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });
