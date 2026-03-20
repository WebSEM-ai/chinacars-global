import type { Brand as BrandType, Model as ModelType } from '@/db/schema';

export function generateCarJsonLd(model: any, brand: any, locale: string) {
  const descKey = locale === 'ro' ? 'descriptionRo' : 'descriptionEn';

  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${brand.name} ${model.name}`,
    brand: {
      '@type': 'Brand',
      name: brand.name,
    },
    model: model.name,
    vehicleModelDate: model.year?.toString(),
    fuelType: mapPropulsionToFuelType(model.propulsion),
    numberOfDoors: 4,
    vehicleSeatingCapacity: model.seats,
    description: model[descKey],
    ...(model.priceEurFrom && {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: model.priceEurFrom,
        ...(model.priceEurTo && { highPrice: model.priceEurTo }),
      },
    }),
    ...(model.powerKw && {
      vehicleEngine: {
        '@type': 'EngineSpecification',
        enginePower: {
          '@type': 'QuantitativeValue',
          value: model.powerKw,
          unitCode: 'KWT',
        },
        torque: model.torqueNm ? {
          '@type': 'QuantitativeValue',
          value: model.torqueNm,
          unitCode: 'NM',
        } : undefined,
      },
    }),
    ...(model.topSpeedKmh && {
      speed: {
        '@type': 'QuantitativeValue',
        value: model.topSpeedKmh,
        unitCode: 'KMH',
      },
    }),
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebsiteJsonLd(locale: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chinacars.global';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ChinaCars.Global',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/search?query={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

function mapPropulsionToFuelType(propulsion: string | null): string {
  switch (propulsion) {
    case 'BEV': return 'Electricity';
    case 'PHEV': return 'Electricity, Gasoline';
    case 'HEV': return 'Gasoline, Electricity';
    case 'ICE': return 'Gasoline';
    default: return 'Electricity';
  }
}
