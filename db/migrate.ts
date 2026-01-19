import { SQLiteDatabase } from 'expo-sqlite';
import { createUsers } from './migrations/001_create_users';
import { createFinanceAccounts } from './migrations/002_create_finance_accounts';

const migrations = [
    createUsers,
    createFinanceAccounts
];

export const runMigrations = async (db: SQLiteDatabase) => {
    for (const migration of migrations) {
        const result = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM migrations WHERE name = ?',
            [migration.name]
        );

        if (result?.count === 0) {
            console.log(`[MIGRATION] Running ${migration.name}`);
            await migration.up(db);
            await db.runAsync(
                'INSERT INTO migrations (name, run_at) VALUES (?, ?)',
                [migration.name, new Date().toISOString()]
            );
        }
    }
};
