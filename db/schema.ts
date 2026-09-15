import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// 1. Registo diário de sono e ciclos
export const sleepEntries = sqliteTable('sleep_entries', {
  id: text('id').primaryKey(),
  targetBedtime: text('target_bedtime').notNull(),
  actualBedtime: text('actual_bedtime'),
  targetWakeTime: text('target_wake_time').notNull(),
  actualWakeTime: text('actual_wake_time'),
  cyclesTarget: integer('cycles_target').notNull(),
  latencyMin: integer('latency_min').default(14).notNull(),
  morningEnergyScore: integer('morning_energy_score'), // 1 a 5
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  deletedAt: text('deleted_at'), // RGPD Soft-delete
});

// 2. Registo de sessões de luz solar matinal
export const lightSessions = sqliteTable('light_sessions', {
  id: text('id').primaryKey(),
  startedAt: text('started_at').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  type: text('type').notNull(), // 'direct_sun' | 'cloudy' | 'window'
  solarElevationDeg: real('solar_elevation_deg'),
  createdAt: text('created_at').notNull(),
  deletedAt: text('deleted_at'),
});

// 3. Registo de ingestão de cafeína
export const caffeineEntries = sqliteTable('caffeine_entries', {
  id: text('id').primaryKey(),
  consumedAt: text('consumed_at').notNull(),
  amountMg: integer('amount_mg').notNull(),
  source: text('source').notNull(), // 'espresso' | 'filter' | 'tea' | 'energy'
  createdAt: text('created_at').notNull(),
  deletedAt: text('deleted_at'),
});

// 4. Parâmetros circadianos do utilizador (Offline & Locais)
export const userCircadianProfile = sqliteTable('user_circadian_profile', {
  id: text('id').primaryKey(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  caffeineHalfLifeHours: real('caffeine_half_life_hours').default(5.5).notNull(),
  targetSleepDurationHours: real('target_sleep_duration_hours').default(7.5).notNull(),
  windDownMinutes: integer('wind_down_minutes').default(45).notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type SleepEntry = typeof sleepEntries.$inferSelect;
export type NewSleepEntry = typeof sleepEntries.$inferInsert;

export type LightSession = typeof lightSessions.$inferSelect;
export type NewLightSession = typeof lightSessions.$inferInsert;

export type CaffeineEntry = typeof caffeineEntries.$inferSelect;
export type NewCaffeineEntry = typeof caffeineEntries.$inferInsert;

export type UserCircadianProfile = typeof userCircadianProfile.$inferSelect;
