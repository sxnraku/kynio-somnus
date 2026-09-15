import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

let dbInstance: any = null;
let sqliteDbInstance: any = null;

export function getRawSqlite() {
  if (!sqliteDbInstance) {
    try {
      sqliteDbInstance = openDatabaseSync('kynio_somnus.db');
    } catch {
      // Fallback em ambiente Web sem VFS nativo
      sqliteDbInstance = {
        execSync: () => {},
        runSync: () => ({ changes: 1, lastInsertRowId: 1 }),
        getAllSync: () => [],
        getFirstSync: () => null,
      };
    }
  }
  return sqliteDbInstance;
}

export function getDatabase() {
  if (!dbInstance) {
    try {
      const sqlite = getRawSqlite();
      dbInstance = drizzle(sqlite, { schema });
    } catch {
      // Fallback gracioso
    }
  }
  return dbInstance;
}
