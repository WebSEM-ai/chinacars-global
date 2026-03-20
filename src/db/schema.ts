import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Brands ──────────────────────────────────────────────────────────────────

export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  descriptionEn: text('description_en'),
  descriptionRo: text('description_ro'),
  foundedYear: integer('founded_year'),
  isPublished: boolean('is_published').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const brandsRelations = relations(brands, ({ many }) => ({
  models: many(models),
}));

// ─── Models ──────────────────────────────────────────────────────────────────

export const models = pgTable('models', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id')
    .references(() => brands.id)
    .notNull(),
  slug: varchar('slug', { length: 200 }).unique().notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  propulsion: varchar('propulsion', { length: 10 }), // BEV | PHEV | HEV | ICE
  segment: varchar('segment', { length: 20 }), // sedan | suv | hatchback | mpv | pickup | coupe | wagon
  year: integer('year'),
  priceEurFrom: integer('price_eur_from'),
  priceEurTo: integer('price_eur_to'),
  priceUsdFrom: integer('price_usd_from'),
  priceUsdTo: integer('price_usd_to'),
  batteryKwh: numeric('battery_kwh', { precision: 5, scale: 1 }),
  rangeWltpKm: integer('range_wltp_km'),
  powerKw: integer('power_kw'),
  powerHp: integer('power_hp'),
  torqueNm: integer('torque_nm'),
  topSpeedKmh: integer('top_speed_kmh'),
  acceleration0100: numeric('acceleration_0_100', { precision: 4, scale: 1 }),
  lengthMm: integer('length_mm'),
  widthMm: integer('width_mm'),
  heightMm: integer('height_mm'),
  wheelbaseMm: integer('wheelbase_mm'),
  trunkLiters: integer('trunk_liters'),
  seats: integer('seats'),
  driveType: varchar('drive_type', { length: 10 }), // FWD | RWD | AWD
  chargeTimeDcMin: integer('charge_time_dc_min'),
  chargePowerDcKw: numeric('charge_power_dc_kw', { precision: 5, scale: 1 }),
  chargePowerAcKw: numeric('charge_power_ac_kw', { precision: 4, scale: 1 }),
  ncapStars: integer('ncap_stars'),
  euHomologated: boolean('eu_homologated').default(false),
  euTariffPct: numeric('eu_tariff_pct', { precision: 4, scale: 1 }),
  serviceEurope: boolean('service_europe').default(false),
  warrantyYears: integer('warranty_years'),
  warrantyKm: integer('warranty_km'),
  descriptionEn: text('description_en'),
  descriptionRo: text('description_ro'),
  highlightsEn: jsonb('highlights_en'),
  highlightsRo: jsonb('highlights_ro'),
  videoUrl: text('video_url'),
  markets: text('markets').array(),
  isPublished: boolean('is_published').default(false),
  isFeatured: boolean('is_featured').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const modelsRelations = relations(models, ({ one, many }) => ({
  brand: one(brands, {
    fields: [models.brandId],
    references: [brands.id],
  }),
  variants: many(modelVariants),
  images: many(images),
}));

// ─── Model Variants ──────────────────────────────────────────────────────────

export const modelVariants = pgTable('model_variants', {
  id: serial('id').primaryKey(),
  modelId: integer('model_id')
    .references(() => models.id)
    .notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  priceEur: integer('price_eur'),
  priceUsd: integer('price_usd'),
  batteryKwh: numeric('battery_kwh', { precision: 5, scale: 1 }),
  rangeWltpKm: integer('range_wltp_km'),
  powerKw: integer('power_kw'),
  powerHp: integer('power_hp'),
  driveType: varchar('drive_type', { length: 10 }),
  sortOrder: integer('sort_order').default(0),
});

export const modelVariantsRelations = relations(modelVariants, ({ one }) => ({
  model: one(models, {
    fields: [modelVariants.modelId],
    references: [models.id],
  }),
}));

// ─── Images ──────────────────────────────────────────────────────────────────

export const images = pgTable('images', {
  id: serial('id').primaryKey(),
  modelId: integer('model_id')
    .references(() => models.id)
    .notNull(),
  url: text('url').notNull(),
  thumbUrl: text('thumb_url'),
  altEn: varchar('alt_en', { length: 300 }),
  altRo: varchar('alt_ro', { length: 300 }),
  type: varchar('type', { length: 20 }), // hero | gallery | interior | detail
  sortOrder: integer('sort_order').default(0),
});

export const imagesRelations = relations(images, ({ one }) => ({
  model: one(models, {
    fields: [images.modelId],
    references: [models.id],
  }),
}));

// ─── Admin Users ─────────────────────────────────────────────────────────────

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 200 }),
  role: varchar('role', { length: 20 }).default('editor'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── TypeScript Types ────────────────────────────────────────────────────────

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;

export type Model = typeof models.$inferSelect;
export type NewModel = typeof models.$inferInsert;

export type ModelVariant = typeof modelVariants.$inferSelect;
export type NewModelVariant = typeof modelVariants.$inferInsert;

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
