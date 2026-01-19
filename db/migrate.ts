import { SQLiteDatabase } from 'expo-sqlite';
import { createUsers } from './migrations/001_create_users';
import { createFinanceAccounts } from './migrations/002_create_finance_accounts';
import { createBudgets } from './migrations/003_create_budgets';
import { createTransactions } from './migrations/004_create_transactions';
import { createRoutines } from './migrations/005_create_routines';
import { createTasks } from './migrations/006_create_tasks';
import { createTaskDependencies } from './migrations/007_create_task_dependencies';
import { createTimeBlocks } from './migrations/008_create_time_blocks';
import { createHabitLogs } from './migrations/009_create_habit_logs';
import { createLifeNotes } from './migrations/010_create_life_notes';
import { createNotificationsQueue } from './migrations/011_create_notifications_queue';

const migrations = [
    createUsers,
    createFinanceAccounts,
    createBudgets,
    createTransactions,
    createRoutines,
    createTasks,
    createTaskDependencies,
    createTimeBlocks,
    createHabitLogs,
    createLifeNotes,
    createNotificationsQueue
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
