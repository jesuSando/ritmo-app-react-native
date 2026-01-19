import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrate';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDB() {
    if (db) return db;

    db = await SQLite.openDatabaseAsync('app.db');

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      run_at TEXT NOT NULL
    );
  `);

    await runMigrations(db);

    console.log('[DATABASE] Inicializada correctamente');
    return db;
}

export function getDB() {
    if (!db) {
        throw new Error('DB no inicializada. Llama initDB primero.');
    }
    return db;
}
