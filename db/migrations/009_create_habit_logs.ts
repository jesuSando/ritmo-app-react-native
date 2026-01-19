import { Migration } from '../../types/Migration';

export const createHabitLogs: Migration = {
    name: '009_create_habit_logs',
    up: async (db) => {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routine_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        notes TEXT,
        FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
      );
    `);
    },
};
