import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { brands, models, images } from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function seedMissing() {
  console.log('Adding missing: Chery brand + BYD Atto 2...');

  // ─── Chery Brand ───────────────────────────────────────────────────────────

  const [chery] = await db
    .insert(brands)
    .values([
      {
        slug: 'chery',
        name: 'Chery',
        logoUrl: null,
        websiteUrl: 'https://www.chery.com',
        descriptionEn:
          "Chery Automobile is one of China's largest independent automakers, founded in 1997. Known for affordable SUVs and sedans, Chery entered Romania in July 2025 and quickly reached the Top 10 brands by early 2026 with a 3.5% market share.",
        descriptionRo:
          'Chery Automobile este unul dintre cei mai mari producatori auto independenti din China, fondat in 1997. Cunoscut pentru SUV-uri si sedanuri accesibile, Chery a intrat in Romania in iulie 2025 si a ajuns rapid in Top 10 branduri la inceputul lui 2026 cu o cota de piata de 3.5%.',
        foundedYear: 1997,
        isPublished: true,
        sortOrder: 7,
      },
    ])
    .returning();

  console.log(`✓ Chery brand created (id: ${chery.id})`);

  // ─── Chery Models ──────────────────────────────────────────────────────────

  const cheryModels = await db
    .insert(models)
    .values([
      {
        brandId: chery.id,
        slug: 'chery-tiggo-7-pro',
        name: 'Tiggo 7 Pro',
        propulsion: 'ICE',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 25990,
        priceEurTo: 30990,
        priceUsdFrom: 28100,
        priceUsdTo: 33500,
        batteryKwh: null,
        rangeWltpKm: null,
        powerKw: 115,
        powerHp: 156,
        torqueNm: 230,
        topSpeedKmh: 190,
        acceleration0100: '9.8',
        lengthMm: 4500,
        widthMm: 1842,
        heightMm: 1746,
        wheelbaseMm: 2670,
        trunkLiters: 475,
        seats: 5,
        driveType: 'FWD',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 7,
        warrantyKm: 150000,
        descriptionEn:
          'The Chery Tiggo 7 Pro is a well-equipped compact SUV offering remarkable value, with premium features typically found in cars costing significantly more. It quickly became one of the best-sellers after Chery entered Romania.',
        descriptionRo:
          'Chery Tiggo 7 Pro este un SUV compact bine echipat oferind o valoare remarcabila, cu dotari premium gasite de obicei la masini mult mai scumpe. A devenit rapid unul dintre cele mai vandute modele dupa intrarea Chery in Romania.',
        highlightsEn: [
          '1.5T TGDI engine',
          'Premium equipment as standard',
          '7-year / 150,000 km warranty',
          'Top 10 brand in Romania',
        ],
        highlightsRo: [
          'Motor 1.5T TGDI',
          'Dotari premium de serie',
          'Garantie 7 ani / 150.000 km',
          'Brand Top 10 in Romania',
        ],
        markets: ['DE', 'FR', 'IT', 'ES', 'RO'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 1,
      },
      {
        brandId: chery.id,
        slug: 'chery-tiggo-8-pro',
        name: 'Tiggo 8 Pro',
        propulsion: 'ICE',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 31990,
        priceEurTo: 37990,
        priceUsdFrom: 34600,
        priceUsdTo: 41100,
        batteryKwh: null,
        rangeWltpKm: null,
        powerKw: 145,
        powerHp: 197,
        torqueNm: 290,
        topSpeedKmh: 195,
        acceleration0100: '8.5',
        lengthMm: 4745,
        widthMm: 1860,
        heightMm: 1745,
        wheelbaseMm: 2710,
        trunkLiters: 192,
        seats: 7,
        driveType: 'FWD',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 7,
        warrantyKm: 150000,
        descriptionEn:
          'The Chery Tiggo 8 Pro is a 7-seat mid-size SUV with a powerful 1.6T engine, generous equipment, and spacious three-row seating for families.',
        descriptionRo:
          'Chery Tiggo 8 Pro este un SUV de dimensiune medie cu 7 locuri, motor 1.6T puternic, echipare generoasa si trei randuri de scaune spatioase pentru familii.',
        highlightsEn: [
          '7-seat configuration',
          '1.6T TGDI engine',
          'Three-row seating',
          '7-year warranty',
        ],
        highlightsRo: [
          'Configuratie 7 locuri',
          'Motor 1.6T TGDI',
          'Trei randuri de scaune',
          'Garantie 7 ani',
        ],
        markets: ['DE', 'FR', 'IT', 'ES', 'RO'],
        isPublished: true,
        sortOrder: 2,
      },
    ])
    .returning();

  console.log(`✓ ${cheryModels.length} Chery models created`);

  // ─── BYD Atto 2 ────────────────────────────────────────────────────────────

  // Get BYD brand id
  const allBrands = await db.select().from(brands);
  const bydBrand = allBrands.find((b) => b.slug === 'byd');
  if (!bydBrand) throw new Error('BYD brand not found');

  const [atto2] = await db
    .insert(models)
    .values([
      {
        brandId: bydBrand.id,
        slug: 'byd-atto-2',
        name: 'Atto 2',
        propulsion: 'BEV',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 21990,
        priceEurTo: 25990,
        priceUsdFrom: 23800,
        priceUsdTo: 28100,
        batteryKwh: '45.1',
        rangeWltpKm: 312,
        powerKw: 130,
        powerHp: 177,
        torqueNm: 210,
        topSpeedKmh: 160,
        acceleration0100: '7.9',
        lengthMm: 4310,
        widthMm: 1830,
        heightMm: 1675,
        wheelbaseMm: 2620,
        trunkLiters: 400,
        seats: 5,
        driveType: 'FWD',
        chargeTimeDcMin: 30,
        chargePowerDcKw: '65.0',
        chargePowerAcKw: '7.0',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 6,
        warrantyKm: 150000,
        descriptionEn:
          "The BYD Atto 2 is the most affordable BYD in Europe — a compact electric crossover perfect for urban driving with Blade Battery safety and modern tech. Starting at under €22,000, it's one of the cheapest EVs on the market.",
        descriptionRo:
          'BYD Atto 2 este cel mai accesibil BYD din Europa — un crossover electric compact perfect pentru condusul urban cu siguranta Blade Battery si tehnologie moderna. Cu un pret de pornire sub 22.000 €, este unul dintre cele mai ieftine EV-uri de pe piata.',
        highlightsEn: [
          'Most affordable BYD in Europe',
          'Blade Battery technology',
          'Compact urban EV crossover',
          '312 km WLTP range',
        ],
        highlightsRo: [
          'Cel mai accesibil BYD din Europa',
          'Tehnologie Blade Battery',
          'Crossover EV urban compact',
          '312 km autonomie WLTP',
        ],
        markets: ['DE', 'FR', 'NL', 'RO', 'IT', 'ES'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 7,
      },
    ])
    .returning();

  console.log(`✓ BYD Atto 2 created (id: ${atto2.id})`);

  // ─── Images ────────────────────────────────────────────────────────────────

  // Atto 2 hero image
  await db.insert(images).values([
    {
      modelId: atto2.id,
      url: '/images/BYD-ATTO-2.webp',
      altEn: 'BYD Atto 2 exterior press photo',
      altRo: 'BYD Atto 2 foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
  ]);

  console.log('✓ BYD Atto 2 hero image linked');

  // Note: Chery Tiggo models need press images to be downloaded
  console.log('⚠ Chery Tiggo 7 Pro & 8 Pro need press images downloaded');

  console.log('\n✅ Seed complete!');
  console.log('  Added: Chery brand + Tiggo 7 Pro + Tiggo 8 Pro');
  console.log('  Added: BYD Atto 2 + hero image');

  process.exit(0);
}

seedMissing().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
