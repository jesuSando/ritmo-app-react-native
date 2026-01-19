import { Migration } from '../../types/Migration';

export const createTimeBlocks: Migration = {
    name: '008_create_time_blocks',
    up: async (db) => {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS time_blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        recurring_days TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    },
};
