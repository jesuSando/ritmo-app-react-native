import { Migration } from '../../types/Migration';

export const createTasks: Migration = {
    name: '006_create_tasks',
    up: async (db) => {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        allow_overlap INTEGER DEFAULT 0,
        status TEXT CHECK(status IN ('pending','completed','discarded')) DEFAULT 'pending',
        priority TEXT CHECK(priority IN ('low','medium','high')) DEFAULT 'medium',
        origin_routine_id INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (origin_routine_id) REFERENCES routines(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    },
};
