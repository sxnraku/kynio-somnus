import { getRawSqlite, getDatabase } from '@/db/client';
import {
  sleepEntries,
  lightSessions,
  caffeineEntries,
  userCircadianProfile,
  type SleepEntry,
  type NewSleepEntry,
  type LightSession,
  type NewLightSession,
  type CaffeineEntry,
  type NewCaffeineEntry,
  type UserCircadianProfile,
} from '@/db/schema';
import { eq, desc, isNull } from 'drizzle-orm';

export function initializeDatabase(): void {
  const sqlite = getRawSqlite();
  sqlite.execSync(`
    CREATE TABLE IF NOT EXISTS sleep_entries (
      id TEXT PRIMARY KEY NOT NULL,
      target_bedtime TEXT NOT NULL,
      actual_bedtime TEXT,
      target_wake_time TEXT NOT NULL,
      actual_wake_time TEXT,
      cycles_target INTEGER NOT NULL,
      latency_min INTEGER DEFAULT 14 NOT NULL,
      morning_energy_score INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS light_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      started_at TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      type TEXT NOT NULL,
      solar_elevation_deg REAL,
      created_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS caffeine_entries (
      id TEXT PRIMARY KEY NOT NULL,
      consumed_at TEXT NOT NULL,
      amount_mg INTEGER NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS user_circadian_profile (
      id TEXT PRIMARY KEY NOT NULL,
      latitude REAL,
      longitude REAL,
      caffeine_half_life_hours REAL DEFAULT 5.5 NOT NULL,
      target_sleep_duration_hours REAL DEFAULT 7.5 NOT NULL,
      wind_down_minutes INTEGER DEFAULT 45 NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export async function recordSleepEntry(entry: NewSleepEntry): Promise<void> {
  const db = getDatabase();
  await db.insert(sleepEntries).values(entry);
}

export async function getRecentSleepEntries(limit = 14): Promise<SleepEntry[]> {
  const db = getDatabase();
  return db
    .select()
    .from(sleepEntries)
    .where(isNull(sleepEntries.deletedAt))
    .orderBy(desc(sleepEntries.createdAt))
    .limit(limit);
}

export async function recordLightSession(session: NewLightSession): Promise<void> {
  const db = getDatabase();
  await db.insert(lightSessions).values(session);
}

export async function getRecentLightSessions(limit = 14): Promise<LightSession[]> {
  const db = getDatabase();
  return db
    .select()
    .from(lightSessions)
    .where(isNull(lightSessions.deletedAt))
    .orderBy(desc(lightSessions.startedAt))
    .limit(limit);
}

export async function recordCaffeineEntry(entry: NewCaffeineEntry): Promise<void> {
  const db = getDatabase();
  await db.insert(caffeineEntries).values(entry);
}

export async function getRecentCaffeineEntries(limit = 20): Promise<CaffeineEntry[]> {
  const db = getDatabase();
  return db
    .select()
    .from(caffeineEntries)
    .where(isNull(caffeineEntries.deletedAt))
    .orderBy(desc(caffeineEntries.consumedAt))
    .limit(limit);
}

// Conformidade RGPD: Exportação Integral em JSON
export async function exportAllUserDataJson(): Promise<string> {
  const db = getDatabase();
  const sleep = await db.select().from(sleepEntries);
  const light = await db.select().from(lightSessions);
  const caffeine = await db.select().from(caffeineEntries);
  const profile = await db.select().from(userCircadianProfile);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    formatVersion: '1.0.0',
    compliance: 'GDPR / Local-First',
    data: {
      sleepEntries: sleep,
      lightSessions: light,
      caffeineEntries: caffeine,
      userProfile: profile,
    },
  };

  return JSON.stringify(exportPayload, null, 2);
}

// Conformidade RGPD: Direito ao Esquecimento (Truncate Atómico Local)
export async function deleteAllUserDataAtomic(): Promise<void> {
  const sqlite = getRawSqlite();
  sqlite.execSync(`
    DELETE FROM sleep_entries;
    DELETE FROM light_sessions;
    DELETE FROM caffeine_entries;
    DELETE FROM user_circadian_profile;
    VACUUM;
  `);
}
