export type Propulsion = 'BEV' | 'PHEV' | 'HEV' | 'ICE';
export type Segment = 'sedan' | 'suv' | 'hatchback' | 'mpv' | 'pickup' | 'coupe' | 'wagon';
export type DriveType = 'FWD' | 'RWD' | 'AWD';
export type ImageType = 'hero' | 'gallery' | 'interior' | 'detail';
export type AdminRole = 'admin' | 'editor';

export interface SearchFilters {
  propulsion?: Propulsion;
  segment?: Segment;
  priceMin?: number;
  priceMax?: number;
  rangeMin?: number;
  rangeMax?: number;
  powerMin?: number;
  powerMax?: number;
  brandId?: number;
  year?: number;
  euHomologated?: boolean;
  query?: string;
}

export interface CompareParams {
  models: string[]; // slugs
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ModelWithBrand {
  id: number;
  slug: string;
  name: string;
  propulsion: string | null;
  segment: string | null;
  year: number | null;
  priceEurFrom: number | null;
  priceEurTo: number | null;
  batteryKwh: string | null;
  rangeWltpKm: number | null;
  powerKw: number | null;
  powerHp: number | null;
  topSpeedKmh: number | null;
  acceleration0100: string | null;
  isFeatured: boolean | null;
  brand: {
    id: number;
    slug: string;
    name: string;
    logoUrl: string | null;
  };
  images: {
    url: string;
    thumbUrl: string | null;
    type: string | null;
  }[];
}
