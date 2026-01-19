import { Migration } from '../../types/Migration';

export const createRoutines: Migration = {
    name: '005_create_routines',
    up: async (db) => {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS routines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        days_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        duration INTEGER NOT NULL,
        conflict_policy TEXT CHECK(conflict_policy IN ('skip','push','notify','force')) DEFAULT 'skip',
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    },
};
