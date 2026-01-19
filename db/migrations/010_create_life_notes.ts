import { Migration } from '../../types/Migration';

export const createLifeNotes: Migration = {
    name: '010_create_life_notes',
    up: async (db) => {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS life_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT NOT NULL,
        mood TEXT,
        created_at TEXT NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    },
};
