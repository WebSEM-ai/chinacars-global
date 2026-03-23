import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { brands, models, images } from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function seedRomania() {
  console.log('Seeding Romania-specific brands & models...');

  // ─── New Brands ────────────────────────────────────────────────────────────

  const [mg, chery, omoda, jaecoo, leapmotor] = await db
    .insert(brands)
    .values([
      {
        slug: 'mg',
        name: 'MG',
        logoUrl: '/images/mg/logo.svg',
        websiteUrl: 'https://www.mgmotor.ro',
        descriptionEn:
          'MG Motor is a British-origin brand now owned by SAIC Motor of China. Relaunched as an electric and hybrid-focused brand, MG offers some of the most affordable EVs and PHEVs in Europe.',
        descriptionRo:
          'MG Motor este un brand de origine britanica detinut acum de SAIC Motor din China. Relansat ca brand axat pe electrice si hibride, MG ofera unele dintre cele mai accesibile EV-uri si PHEV-uri din Europa.',
        foundedYear: 1924,
        isPublished: true,
        sortOrder: 6,
      },
      {
        slug: 'chery',
        name: 'Chery',
        logoUrl: null,
        websiteUrl: 'https://www.chery.com',
        descriptionEn:
          'Chery Automobile is one of China\'s largest independent automakers, founded in 1997. Known for affordable SUVs and sedans, Chery entered Romania in 2025 and quickly reached the Top 10 brands by early 2026.',
        descriptionRo:
          'Chery Automobile este unul dintre cei mai mari producatori auto independenti din China, fondat in 1997. Cunoscut pentru SUV-uri si sedanuri accesibile, Chery a intrat in Romania in 2025 si a ajuns rapid in Top 10 branduri la inceputul lui 2026.',
        foundedYear: 1997,
        isPublished: true,
        sortOrder: 7,
      },
      {
        slug: 'omoda',
        name: 'Omoda',
        logoUrl: '/images/omoda/logo.svg',
        websiteUrl: 'https://www.omodajaecoo.com',
        descriptionEn:
          'Omoda is a modern lifestyle sub-brand of the Chery Group, targeting younger buyers with stylish crossovers and electric vehicles. Launched in Romania in October 2025.',
        descriptionRo:
          'Omoda este un sub-brand modern de lifestyle al Grupului Chery, orientat catre cumparatori tineri cu crossovere elegante si vehicule electrice. Lansat in Romania in octombrie 2025.',
        foundedYear: 2022,
        isPublished: true,
        sortOrder: 8,
      },
      {
        slug: 'jaecoo',
        name: 'Jaecoo',
        logoUrl: '/images/jaecoo/logo.svg',
        websiteUrl: 'https://www.omodajaecoo.com',
        descriptionEn:
          'Jaecoo is Chery Group\'s premium off-road and adventure sub-brand, offering rugged yet refined SUVs with advanced hybrid powertrains. Available in Romania since October 2025.',
        descriptionRo:
          'Jaecoo este sub-brandul premium off-road si de aventura al Grupului Chery, oferind SUV-uri robuste dar rafinate cu motorizari hibride avansate. Disponibil in Romania din octombrie 2025.',
        foundedYear: 2023,
        isPublished: true,
        sortOrder: 9,
      },
      {
        slug: 'leapmotor',
        name: 'Leapmotor',
        logoUrl: '/images/leapmotor/logo.svg',
        websiteUrl: 'https://www.leapmotor.com',
        descriptionEn:
          'Leapmotor is a Chinese EV startup founded in 2015, now in a strategic partnership with Stellantis for European distribution. Known for affordable, well-equipped electric vehicles.',
        descriptionRo:
          'Leapmotor este un startup EV chinezesc fondat in 2015, acum intr-un parteneriat strategic cu Stellantis pentru distributia europeana. Cunoscut pentru vehicule electrice accesibile si bine echipate.',
        foundedYear: 2015,
        isPublished: true,
        sortOrder: 10,
      },
    ])
    .returning();

  console.log('5 new brands created: MG, Chery, Omoda, Jaecoo, Leapmotor');

  // ─── Get existing brand IDs ────────────────────────────────────────────────
  // We need BYD and Great Wall IDs for adding missing models
  const existingBrands = await db.select().from(brands);
  const bydBrand = existingBrands.find((b) => b.slug === 'byd');
  const gwmBrand = existingBrands.find((b) => b.slug === 'great-wall');

  if (!bydBrand || !gwmBrand) {
    throw new Error('BYD or Great Wall brand not found — run the base seed first');
  }

  // ─── New BYD models (missing from Romania) ─────────────────────────────────

  const newModels = await db
    .insert(models)
    .values([
      // ── BYD Seal U DM-i ──
      {
        brandId: bydBrand.id,
        slug: 'byd-seal-u-dmi',
        name: 'Seal U DM-i',
        propulsion: 'PHEV',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 33990,
        priceEurTo: 39990,
        priceUsdFrom: 36700,
        priceUsdTo: 43200,
        batteryKwh: '18.3',
        rangeWltpKm: 80,
        powerKw: 160,
        powerHp: 218,
        torqueNm: 300,
        topSpeedKmh: 185,
        acceleration0100: '8.9',
        lengthMm: 4775,
        widthMm: 1890,
        heightMm: 1670,
        wheelbaseMm: 2765,
        trunkLiters: 425,
        seats: 5,
        driveType: 'FWD',
        chargeTimeDcMin: 35,
        chargePowerDcKw: '30.0',
        chargePowerAcKw: '7.0',
        ncapStars: 5,
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 6,
        warrantyKm: 150000,
        descriptionEn:
          'The BYD Seal U DM-i is the best-selling Chinese car in Romania — a spacious PHEV SUV combining ultra-low fuel consumption with BYD\'s proven DM-i super hybrid technology.',
        descriptionRo:
          'BYD Seal U DM-i este cea mai vanduta masina chinezeasca din Romania — un SUV PHEV spatios care combina consumul ultra-redus cu tehnologia hibrida DM-i dovedita de BYD.',
        highlightsEn: [
          'DM-i super hybrid technology',
          '80 km electric range',
          'Best-selling Chinese car in RO',
          '5-star Euro NCAP',
        ],
        highlightsRo: [
          'Tehnologie DM-i super hibrid',
          '80 km autonomie electrica',
          'Cea mai vanduta masina chineza in RO',
          '5 stele Euro NCAP',
        ],
        markets: ['DE', 'FR', 'NL', 'SE', 'NO', 'RO', 'IT', 'ES'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 4,
      },

      // ── BYD Sealion 7 ──
      {
        brandId: bydBrand.id,
        slug: 'byd-sealion-7',
        name: 'Sealion 7',
        propulsion: 'BEV',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 47490,
        priceEurTo: 53490,
        priceUsdFrom: 51300,
        priceUsdTo: 57800,
        batteryKwh: '91.3',
        rangeWltpKm: 502,
        powerKw: 230,
        powerHp: 313,
        torqueNm: 380,
        topSpeedKmh: 215,
        acceleration0100: '4.5',
        lengthMm: 4830,
        widthMm: 1925,
        heightMm: 1620,
        wheelbaseMm: 2930,
        trunkLiters: 520,
        seats: 5,
        driveType: 'RWD',
        chargeTimeDcMin: 24,
        chargePowerDcKw: '230.0',
        chargePowerAcKw: '11.0',
        ncapStars: 5,
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 6,
        warrantyKm: 150000,
        descriptionEn:
          'The BYD Sealion 7 is a sleek electric SUV coupe competing directly with the Tesla Model Y, offering superior range and fast charging on BYD\'s e-Platform 3.0 Evo.',
        descriptionRo:
          'BYD Sealion 7 este un SUV coupe electric elegant care concureaza direct cu Tesla Model Y, oferind autonomie superioara si incarcare rapida pe platforma e-Platform 3.0 Evo.',
        highlightsEn: [
          'e-Platform 3.0 Evo',
          '230 kW DC charging',
          'Tesla Model Y competitor',
          'Blade Battery',
        ],
        highlightsRo: [
          'e-Platform 3.0 Evo',
          'Incarcare DC 230 kW',
          'Competitor Tesla Model Y',
          'Blade Battery',
        ],
        markets: ['DE', 'FR', 'NL', 'SE', 'NO', 'RO', 'IT', 'ES'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 5,
      },

      // ── BYD Atto 2 ──
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
          'The BYD Atto 2 is the most affordable BYD in Europe — a compact electric crossover perfect for urban driving with Blade Battery safety and modern tech.',
        descriptionRo:
          'BYD Atto 2 este cel mai accesibil BYD din Europa — un crossover electric compact perfect pentru condusul urban cu siguranta Blade Battery si tehnologie moderna.',
        highlightsEn: [
          'Most affordable BYD',
          'Blade Battery',
          'Compact urban EV',
          '312 km WLTP range',
        ],
        highlightsRo: [
          'Cel mai accesibil BYD',
          'Blade Battery',
          'EV urban compact',
          '312 km autonomie WLTP',
        ],
        markets: ['DE', 'FR', 'NL', 'RO', 'IT', 'ES'],
        isPublished: true,
        sortOrder: 6,
      },

      // ── MG Models ──────────────────────────────────────────────────────────

      // MG ZS
      {
        brandId: mg.id,
        slug: 'mg-zs',
        name: 'ZS',
        propulsion: 'ICE',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 16990,
        priceEurTo: 21990,
        priceUsdFrom: 18400,
        priceUsdTo: 23800,
        batteryKwh: null,
        rangeWltpKm: null,
        powerKw: 82,
        powerHp: 111,
        torqueNm: 148,
        topSpeedKmh: 185,
        acceleration0100: '10.9',
        lengthMm: 4323,
        widthMm: 1809,
        heightMm: 1653,
        wheelbaseMm: 2585,
        trunkLiters: 443,
        seats: 5,
        driveType: 'FWD',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 7,
        warrantyKm: 150000,
        descriptionEn:
          'The MG ZS is one of the most affordable compact SUVs on the Romanian market, offering exceptional value with modern design and a 7-year warranty.',
        descriptionRo:
          'MG ZS este unul dintre cele mai accesibile SUV-uri compacte de pe piata romaneasca, oferind un raport calitate-pret exceptional cu design modern si garantie 7 ani.',
        highlightsEn: [
          '7-year / 150,000 km warranty',
          'Most affordable SUV in segment',
          'Modern infotainment',
          'Dacia Duster competitor',
        ],
        highlightsRo: [
          'Garantie 7 ani / 150.000 km',
          'Cel mai accesibil SUV din segment',
          'Infotainment modern',
          'Competitor Dacia Duster',
        ],
        markets: ['DE', 'FR', 'NL', 'SE', 'NO', 'RO', 'UK'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 1,
      },

      // MG ZS Hybrid+
      {
        brandId: mg.id,
        slug: 'mg-zs-hybrid',
        name: 'ZS Hybrid+',
        propulsion: 'HEV',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 22990,
        priceEurTo: 26990,
        priceUsdFrom: 24800,
        priceUsdTo: 29200,
        batteryKwh: '1.8',
        rangeWltpKm: null,
        powerKw: 145,
        powerHp: 197,
        torqueNm: 250,
        topSpeedKmh: 185,
        acceleration0100: '8.0',
        lengthMm: 4430,
        widthMm: 1818,
        heightMm: 1655,
        wheelbaseMm: 2610,
        trunkLiters: 443,
        seats: 5,
        driveType: 'FWD',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 7,
        warrantyKm: 150000,
        descriptionEn:
          'The MG ZS Hybrid+ adds a 3-speed DHT hybrid system to the popular ZS, delivering impressive fuel economy and smooth power delivery in a compact SUV package.',
        descriptionRo:
          'MG ZS Hybrid+ adauga un sistem hibrid DHT cu 3 trepte popularului ZS, oferind un consum impresionant si o livrare fluida a puterii intr-un pachet SUV compact.',
        highlightsEn: [
          '3-speed DHT hybrid',
          '197 hp combined power',
          'Low fuel consumption',
          '7-year warranty',
        ],
        highlightsRo: [
          'Hibrid DHT cu 3 trepte',
          '197 CP putere combinata',
          'Consum redus',
          'Garantie 7 ani',
        ],
        markets: ['DE', 'FR', 'NL', 'RO', 'UK'],
        isPublished: true,
        sortOrder: 2,
      },

      // MG HS
      {
        brandId: mg.id,
        slug: 'mg-hs',
        name: 'HS',
        propulsion: 'PHEV',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 32990,
        priceEurTo: 37990,
        priceUsdFrom: 35700,
        priceUsdTo: 41100,
        batteryKwh: '24.7',
        rangeWltpKm: 100,
        powerKw: 191,
        powerHp: 260,
        torqueNm: 370,
        topSpeedKmh: 195,
        acceleration0100: '6.8',
        lengthMm: 4670,
        widthMm: 1890,
        heightMm: 1664,
        wheelbaseMm: 2750,
        trunkLiters: 507,
        seats: 5,
        driveType: 'FWD',
        chargeTimeDcMin: null,
        chargePowerDcKw: null,
        chargePowerAcKw: '7.4',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 7,
        warrantyKm: 150000,
        descriptionEn:
          'The MG HS is a spacious mid-size plug-in hybrid SUV offering 100 km of electric range, premium features, and the brand\'s signature 7-year warranty at a competitive price.',
        descriptionRo:
          'MG HS este un SUV plug-in hybrid de dimensiune medie spatios, oferind 100 km de autonomie electrica, dotari premium si garantia de 7 ani a brandului la un pret competitiv.',
        highlightsEn: [
          'PHEV with 100 km electric range',
          'Spacious mid-size SUV',
          '7-year warranty',
          'Premium interior',
        ],
        highlightsRo: [
          'PHEV cu 100 km autonomie electrica',
          'SUV spatios de dimensiune medie',
          'Garantie 7 ani',
          'Interior premium',
        ],
        markets: ['DE', 'FR', 'NL', 'SE', 'RO', 'UK'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 3,
      },

      // MG4
      {
        brandId: mg.id,
        slug: 'mg4',
        name: 'MG4',
        propulsion: 'BEV',
        segment: 'hatchback',
        year: 2025,
        priceEurFrom: 28990,
        priceEurTo: 38990,
        priceUsdFrom: 31300,
        priceUsdTo: 42200,
        batteryKwh: '64.0',
        rangeWltpKm: 450,
        powerKw: 150,
        powerHp: 204,
        torqueNm: 250,
        topSpeedKmh: 160,
        acceleration0100: '7.9',
        lengthMm: 4287,
        widthMm: 1836,
        heightMm: 1516,
        wheelbaseMm: 2705,
        trunkLiters: 363,
        seats: 5,
        driveType: 'RWD',
        chargeTimeDcMin: 26,
        chargePowerDcKw: '144.0',
        chargePowerAcKw: '11.0',
        ncapStars: 5,
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 7,
        warrantyKm: 150000,
        descriptionEn:
          'The MG4 is one of Europe\'s most popular affordable electric hatchbacks, built on SAIC\'s MSP platform with RWD layout for engaging driving dynamics.',
        descriptionRo:
          'MG4 este unul dintre cele mai populare hatchback-uri electrice accesibile din Europa, construit pe platforma MSP de la SAIC cu layout RWD pentru dinamica placuta de condus.',
        highlightsEn: [
          'MSP modular platform',
          'RWD layout',
          '450 km WLTP range',
          '5-star Euro NCAP',
        ],
        highlightsRo: [
          'Platforma modulara MSP',
          'Layout RWD',
          '450 km autonomie WLTP',
          '5 stele Euro NCAP',
        ],
        markets: ['DE', 'FR', 'NL', 'SE', 'NO', 'RO', 'UK'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 4,
      },

      // MG3 Hybrid+
      {
        brandId: mg.id,
        slug: 'mg3-hybrid',
        name: 'MG3 Hybrid+',
        propulsion: 'HEV',
        segment: 'hatchback',
        year: 2025,
        priceEurFrom: 18990,
        priceEurTo: 22990,
        priceUsdFrom: 20500,
        priceUsdTo: 24800,
        batteryKwh: '1.8',
        rangeWltpKm: null,
        powerKw: 145,
        powerHp: 195,
        torqueNm: 250,
        topSpeedKmh: 185,
        acceleration0100: '8.0',
        lengthMm: 4113,
        widthMm: 1797,
        heightMm: 1502,
        wheelbaseMm: 2570,
        trunkLiters: 293,
        seats: 5,
        driveType: 'FWD',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 7,
        warrantyKm: 150000,
        descriptionEn:
          'The MG3 Hybrid+ is an affordable supermini with a 3-speed DHT hybrid system, offering exceptional fuel economy and a fun driving experience at a low price point.',
        descriptionRo:
          'MG3 Hybrid+ este un supermini accesibil cu sistem hibrid DHT cu 3 trepte, oferind un consum exceptional si o experienta de condus placuta la un pret redus.',
        highlightsEn: [
          '3-speed DHT hybrid',
          'Under €19,000',
          '195 hp combined',
          '7-year warranty',
        ],
        highlightsRo: [
          'Hibrid DHT cu 3 trepte',
          'Sub 19.000 €',
          '195 CP combinati',
          'Garantie 7 ani',
        ],
        markets: ['DE', 'FR', 'NL', 'RO', 'UK'],
        isPublished: true,
        sortOrder: 5,
      },

      // ── Chery Models ───────────────────────────────────────────────────────

      // Chery Tiggo 7 Pro
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
          'The Chery Tiggo 7 Pro is a well-equipped compact SUV offering remarkable value, with premium features typically found in cars costing significantly more.',
        descriptionRo:
          'Chery Tiggo 7 Pro este un SUV compact bine echipat oferind o valoare remarcabila, cu dotari premium gasite de obicei la masini mult mai scumpe.',
        highlightsEn: [
          '1.5T TGDI engine',
          'Premium equipment as standard',
          '7-year warranty',
          'Excellent value',
        ],
        highlightsRo: [
          'Motor 1.5T TGDI',
          'Dotari premium de serie',
          'Garantie 7 ani',
          'Valoare excelenta',
        ],
        markets: ['DE', 'FR', 'IT', 'ES', 'RO'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 1,
      },

      // Chery Tiggo 8 Pro
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

      // ── Omoda Models ───────────────────────────────────────────────────────

      // Omoda 5
      {
        brandId: omoda.id,
        slug: 'omoda-5',
        name: 'Omoda 5',
        propulsion: 'ICE',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 23990,
        priceEurTo: 28990,
        priceUsdFrom: 25900,
        priceUsdTo: 31300,
        batteryKwh: null,
        rangeWltpKm: null,
        powerKw: 115,
        powerHp: 156,
        torqueNm: 230,
        topSpeedKmh: 190,
        acceleration0100: '9.3',
        lengthMm: 4400,
        widthMm: 1830,
        heightMm: 1588,
        wheelbaseMm: 2630,
        trunkLiters: 360,
        seats: 5,
        driveType: 'FWD',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 7,
        warrantyKm: 150000,
        descriptionEn:
          'The Omoda 5 is a stylish compact crossover with coupe-like design, targeting young urban buyers with modern tech and an aggressive price point.',
        descriptionRo:
          'Omoda 5 este un crossover compact stilat cu design tip coupe, orientat catre cumparatorii urbani tineri cu tehnologie moderna si un pret agresiv.',
        highlightsEn: [
          'Coupe crossover design',
          '10.25" dual screens',
          '7-year warranty',
          'Under €24,000',
        ],
        highlightsRo: [
          'Design crossover coupe',
          'Ecrane duale 10.25"',
          'Garantie 7 ani',
          'Sub 24.000 €',
        ],
        markets: ['DE', 'FR', 'IT', 'ES', 'RO'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 1,
      },

      // Omoda E5
      {
        brandId: omoda.id,
        slug: 'omoda-e5',
        name: 'Omoda E5',
        propulsion: 'BEV',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 31990,
        priceEurTo: 36990,
        priceUsdFrom: 34600,
        priceUsdTo: 40000,
        batteryKwh: '61.0',
        rangeWltpKm: 430,
        powerKw: 150,
        powerHp: 204,
        torqueNm: 340,
        topSpeedKmh: 171,
        acceleration0100: '7.6',
        lengthMm: 4424,
        widthMm: 1830,
        heightMm: 1588,
        wheelbaseMm: 2630,
        trunkLiters: 360,
        seats: 5,
        driveType: 'FWD',
        chargeTimeDcMin: 28,
        chargePowerDcKw: '80.0',
        chargePowerAcKw: '11.0',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 7,
        warrantyKm: 150000,
        descriptionEn:
          'The Omoda E5 is the fully electric version of the Omoda 5, offering 430 km WLTP range with the same stylish design and modern features.',
        descriptionRo:
          'Omoda E5 este versiunea complet electrica a Omoda 5, oferind 430 km autonomie WLTP cu acelasi design stilat si dotari moderne.',
        highlightsEn: [
          '430 km WLTP range',
          'Electric Omoda 5',
          '80 kW DC fast charging',
          '7-year warranty',
        ],
        highlightsRo: [
          '430 km autonomie WLTP',
          'Omoda 5 electric',
          'Incarcare rapida DC 80 kW',
          'Garantie 7 ani',
        ],
        markets: ['DE', 'FR', 'IT', 'RO'],
        isPublished: true,
        sortOrder: 2,
      },

      // ── Jaecoo Models ──────────────────────────────────────────────────────

      // Jaecoo 7
      {
        brandId: jaecoo.id,
        slug: 'jaecoo-7',
        name: 'Jaecoo 7',
        propulsion: 'PHEV',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 33990,
        priceEurTo: 39990,
        priceUsdFrom: 36700,
        priceUsdTo: 43200,
        batteryKwh: '18.3',
        rangeWltpKm: 85,
        powerKw: 175,
        powerHp: 238,
        torqueNm: 345,
        topSpeedKmh: 195,
        acceleration0100: '7.5',
        lengthMm: 4533,
        widthMm: 1898,
        heightMm: 1699,
        wheelbaseMm: 2672,
        trunkLiters: 412,
        seats: 5,
        driveType: 'AWD',
        chargePowerAcKw: '6.6',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 7,
        warrantyKm: 150000,
        descriptionEn:
          'The Jaecoo 7 is a premium rugged PHEV SUV with Range Rover Velar-inspired design, offering AWD capability and impressive electric range for off-road adventures.',
        descriptionRo:
          'Jaecoo 7 este un SUV PHEV premium robust cu design inspirat de Range Rover Velar, oferind capacitate AWD si autonomie electrica impresionanta pentru aventuri off-road.',
        highlightsEn: [
          'Velar-inspired design',
          'AWD PHEV',
          '85 km electric range',
          '7-year warranty',
        ],
        highlightsRo: [
          'Design inspirat Velar',
          'PHEV AWD',
          '85 km autonomie electrica',
          'Garantie 7 ani',
        ],
        markets: ['DE', 'FR', 'IT', 'ES', 'RO', 'UK'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 1,
      },

      // Jaecoo 8
      {
        brandId: jaecoo.id,
        slug: 'jaecoo-8',
        name: 'Jaecoo 8',
        propulsion: 'PHEV',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 42990,
        priceEurTo: 48990,
        priceUsdFrom: 46500,
        priceUsdTo: 53000,
        batteryKwh: '25.0',
        rangeWltpKm: 100,
        powerKw: 220,
        powerHp: 299,
        torqueNm: 490,
        topSpeedKmh: 200,
        acceleration0100: '6.5',
        lengthMm: 4820,
        widthMm: 1930,
        heightMm: 1750,
        wheelbaseMm: 2820,
        trunkLiters: 520,
        seats: 5,
        driveType: 'AWD',
        chargePowerAcKw: '6.6',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 7,
        warrantyKm: 150000,
        descriptionEn:
          'The Jaecoo 8 is a larger premium PHEV SUV with commanding presence, offering 100 km electric range and robust off-road capability with AWD.',
        descriptionRo:
          'Jaecoo 8 este un SUV PHEV premium mai mare cu prezenta impunatoare, oferind 100 km autonomie electrica si capacitate robusta off-road cu AWD.',
        highlightsEn: [
          'Larger premium SUV',
          '100 km electric range',
          'AWD with off-road modes',
          '7-year warranty',
        ],
        highlightsRo: [
          'SUV premium mai mare',
          '100 km autonomie electrica',
          'AWD cu moduri off-road',
          'Garantie 7 ani',
        ],
        markets: ['DE', 'FR', 'IT', 'RO'],
        isPublished: true,
        sortOrder: 2,
      },

      // ── Leapmotor Models ───────────────────────────────────────────────────

      // Leapmotor T03
      {
        brandId: leapmotor.id,
        slug: 'leapmotor-t03',
        name: 'T03',
        propulsion: 'BEV',
        segment: 'hatchback',
        year: 2025,
        priceEurFrom: 18900,
        priceEurTo: 21900,
        priceUsdFrom: 20400,
        priceUsdTo: 23700,
        batteryKwh: '37.3',
        rangeWltpKm: 265,
        powerKw: 70,
        powerHp: 95,
        torqueNm: 158,
        topSpeedKmh: 130,
        acceleration0100: '12.7',
        lengthMm: 3620,
        widthMm: 1652,
        heightMm: 1577,
        wheelbaseMm: 2400,
        trunkLiters: 210,
        seats: 4,
        driveType: 'FWD',
        chargeTimeDcMin: 36,
        chargePowerDcKw: '48.0',
        chargePowerAcKw: '6.6',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 5,
        warrantyKm: 100000,
        descriptionEn:
          'The Leapmotor T03 is one of Europe\'s most affordable EVs — a charming city car with surprising features for its price, distributed through Stellantis dealerships.',
        descriptionRo:
          'Leapmotor T03 este unul dintre cele mai accesibile EV-uri din Europa — o masina de oras fermecatoare cu dotari surprinzatoare pentru pretul sau, distribuita prin dealerii Stellantis.',
        highlightsEn: [
          'Under €19,000',
          'Stellantis distribution',
          'Smart city car',
          'L2 driver assistance',
        ],
        highlightsRo: [
          'Sub 19.000 €',
          'Distributie Stellantis',
          'Masina de oras smart',
          'Asistenta conducere L2',
        ],
        markets: ['DE', 'FR', 'IT', 'ES', 'RO', 'NL', 'BE'],
        isPublished: true,
        sortOrder: 1,
      },

      // Leapmotor C10
      {
        brandId: leapmotor.id,
        slug: 'leapmotor-c10',
        name: 'C10',
        propulsion: 'BEV',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 36400,
        priceEurTo: 41900,
        priceUsdFrom: 39400,
        priceUsdTo: 45300,
        batteryKwh: '69.9',
        rangeWltpKm: 420,
        powerKw: 170,
        powerHp: 231,
        torqueNm: 320,
        topSpeedKmh: 170,
        acceleration0100: '7.5',
        lengthMm: 4739,
        widthMm: 1900,
        heightMm: 1680,
        wheelbaseMm: 2825,
        trunkLiters: 435,
        seats: 5,
        driveType: 'FWD',
        chargeTimeDcMin: 30,
        chargePowerDcKw: '150.0',
        chargePowerAcKw: '11.0',
        ncapStars: 5,
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 5,
        warrantyKm: 100000,
        descriptionEn:
          'The Leapmotor C10 is a well-equipped mid-size electric SUV with 5-star Euro NCAP safety, built on the LEAP 3.0 architecture and sold through Stellantis network.',
        descriptionRo:
          'Leapmotor C10 este un SUV electric de dimensiune medie bine echipat cu siguranta Euro NCAP de 5 stele, construit pe arhitectura LEAP 3.0 si vandut prin reteaua Stellantis.',
        highlightsEn: [
          '5-star Euro NCAP',
          'LEAP 3.0 architecture',
          'Stellantis distribution',
          '420 km WLTP range',
        ],
        highlightsRo: [
          '5 stele Euro NCAP',
          'Arhitectura LEAP 3.0',
          'Distributie Stellantis',
          '420 km autonomie WLTP',
        ],
        markets: ['DE', 'FR', 'IT', 'ES', 'RO', 'NL', 'BE'],
        isPublished: true,
        isFeatured: true,
        sortOrder: 2,
      },

      // ── GWM / Haval H6 PHEV (add to existing Great Wall brand) ────────────

      {
        brandId: gwmBrand.id,
        slug: 'haval-h6-phev',
        name: 'Haval H6 PHEV',
        propulsion: 'PHEV',
        segment: 'suv',
        year: 2025,
        priceEurFrom: 33990,
        priceEurTo: 38990,
        priceUsdFrom: 36700,
        priceUsdTo: 42200,
        batteryKwh: '19.9',
        rangeWltpKm: 90,
        powerKw: 180,
        powerHp: 245,
        torqueNm: 530,
        topSpeedKmh: 180,
        acceleration0100: '7.8',
        lengthMm: 4683,
        widthMm: 1886,
        heightMm: 1730,
        wheelbaseMm: 2738,
        trunkLiters: 510,
        seats: 5,
        driveType: 'FWD',
        chargePowerAcKw: '6.6',
        euHomologated: true,
        serviceEurope: true,
        warrantyYears: 5,
        warrantyKm: 100000,
        descriptionEn:
          'The Haval H6 PHEV is a spacious plug-in hybrid SUV from Great Wall\'s mainstream brand, offering a compelling mix of electric range, space, and technology.',
        descriptionRo:
          'Haval H6 PHEV este un SUV plug-in hybrid spatios de la brandul mainstream al Great Wall, oferind un mix atractiv de autonomie electrica, spatiu si tehnologie.',
        highlightsEn: [
          'DHT PHEV system',
          '90 km electric range',
          'Spacious interior',
          'Advanced ADAS',
        ],
        highlightsRo: [
          'Sistem DHT PHEV',
          '90 km autonomie electrica',
          'Interior spatios',
          'ADAS avansat',
        ],
        markets: ['DE', 'RO'],
        isPublished: true,
        sortOrder: 3,
      },
    ])
    .returning();

  console.log(`${newModels.length} new models created`);

  // ─── Images ────────────────────────────────────────────────────────────────

  // Build a slug-to-id map for all new models
  const modelMap = new Map(newModels.map((m) => [m.slug, m.id]));

  const imageRecords = [
    // BYD Seal U DM-i
    {
      modelId: modelMap.get('byd-seal-u-dmi')!,
      url: '/images/byd/seal-u-press.jpg',
      altEn: 'BYD Seal U DM-i exterior press photo',
      altRo: 'BYD Seal U DM-i foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // BYD Sealion 7
    {
      modelId: modelMap.get('byd-sealion-7')!,
      url: '/images/byd/sealion7-press.jpg',
      altEn: 'BYD Sealion 7 exterior press photo',
      altRo: 'BYD Sealion 7 foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // BYD Atto 2
    {
      modelId: modelMap.get('byd-atto-2')!,
      url: '/images/BYD-ATTO-2.webp',
      altEn: 'BYD Atto 2 exterior press photo',
      altRo: 'BYD Atto 2 foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // MG ZS
    {
      modelId: modelMap.get('mg-zs')!,
      url: '/images/mg/zs-ev-press.jpg',
      altEn: 'MG ZS exterior press photo',
      altRo: 'MG ZS foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // MG ZS Hybrid+
    {
      modelId: modelMap.get('mg-zs-hybrid')!,
      url: '/images/mg/zs-ev-press.jpg',
      altEn: 'MG ZS Hybrid+ exterior press photo',
      altRo: 'MG ZS Hybrid+ foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // MG HS
    {
      modelId: modelMap.get('mg-hs')!,
      url: '/images/mg/hs-phev-press.jpg',
      altEn: 'MG HS PHEV exterior press photo',
      altRo: 'MG HS PHEV foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // MG4
    {
      modelId: modelMap.get('mg4')!,
      url: '/images/mg/mg4-press.jpg',
      altEn: 'MG4 Electric exterior press photo',
      altRo: 'MG4 Electric foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // MG3 Hybrid+
    {
      modelId: modelMap.get('mg3-hybrid')!,
      url: '/images/mg/mg3-hybrid-press.jpg',
      altEn: 'MG3 Hybrid+ exterior press photo',
      altRo: 'MG3 Hybrid+ foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // Chery Tiggo 7 Pro (no dedicated image yet — use placeholder approach)
    // Chery Tiggo 8 Pro (no dedicated image yet)
    // Omoda 5
    {
      modelId: modelMap.get('omoda-5')!,
      url: '/images/omoda/omoda-5-press.jpg',
      altEn: 'Omoda 5 exterior press photo',
      altRo: 'Omoda 5 foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // Omoda E5
    {
      modelId: modelMap.get('omoda-e5')!,
      url: '/images/omoda/omoda-e5-press.jpg',
      altEn: 'Omoda E5 exterior press photo',
      altRo: 'Omoda E5 foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // Jaecoo 7
    {
      modelId: modelMap.get('jaecoo-7')!,
      url: '/images/jaecoo/jaecoo-7-press.jpg',
      altEn: 'Jaecoo 7 exterior press photo',
      altRo: 'Jaecoo 7 foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // Jaecoo 8
    {
      modelId: modelMap.get('jaecoo-8')!,
      url: '/images/jaecoo/jaecoo-8-press.jpg',
      altEn: 'Jaecoo 8 exterior press photo',
      altRo: 'Jaecoo 8 foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // Leapmotor T03
    {
      modelId: modelMap.get('leapmotor-t03')!,
      url: '/images/leapmotor/t03-press.jpg',
      altEn: 'Leapmotor T03 exterior press photo',
      altRo: 'Leapmotor T03 foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // Leapmotor C10
    {
      modelId: modelMap.get('leapmotor-c10')!,
      url: '/images/leapmotor/c10-press.jpg',
      altEn: 'Leapmotor C10 exterior press photo',
      altRo: 'Leapmotor C10 foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
    // Haval H6 PHEV
    {
      modelId: modelMap.get('haval-h6-phev')!,
      url: '/images/great-wall/haval-h6-press.jpg',
      altEn: 'Haval H6 PHEV exterior press photo',
      altRo: 'Haval H6 PHEV foto exterioara oficiala',
      type: 'hero',
      sortOrder: 1,
    },
  ];

  await db.insert(images).values(imageRecords);
  console.log(`${imageRecords.length} hero images linked`);

  // Also add hero images for existing BYD models that already had images but no DB records
  // (Check if images table is empty for those models first — if running fresh, they won't have any)

  console.log('\n✓ Romania seed complete!');
  console.log('  New brands: MG, Chery, Omoda, Jaecoo, Leapmotor');
  console.log(`  New models: ${newModels.length}`);
  console.log('  Note: Chery Tiggo 7 Pro & 8 Pro need press images downloaded');
  console.log('  Note: BYD Atto 2 uses existing BYD-ATTO-2.webp');

  process.exit(0);
}

seedRomania().catch((err) => {
  console.error('Romania seed failed:', err);
  process.exit(1);
});
