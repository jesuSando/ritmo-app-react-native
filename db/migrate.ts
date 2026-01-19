import { SQLiteDatabase } from 'expo-sqlite';
import * as m001 from './migrations/001_create_users';

type Migration = {
    name: string;
    up: (db: SQLiteDatabase) => Promise<void>;
};

const migrations: Migration[] = [
    { name: '001_create_users', up: m001.up },
];

export async function runMigrations(db: SQLiteDatabase) {
    const result = await db.getAllAsync<{ name: string }>(
        'SELECT name FROM migrations'
    );

    const executed = result.map(m => m.name);

    for (const migration of migrations) {
        if (!executed.includes(migration.name)) {
            console.log(`[MIGRATION] Ejecutando ${migration.name}`);

            await migration.up(db);

            await db.runAsync(
                'INSERT INTO migrations (name, run_at) VALUES (?, ?)',
                migration.name,
                new Date().toISOString()
            );
        }
    }

    console.log('[MIGRATION] Migraciones al día');
}
