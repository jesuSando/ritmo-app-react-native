import { Migration } from '../../types/Migration';

export const createUsers: Migration = {
  name: '001_create_users',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  },
};
