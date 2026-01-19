import { Migration } from '../../types/Migration';

export const createNotificationsQueue: Migration = {
    name: '011_create_notifications_queue',
    up: async (db) => {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notifications_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        reference_id INTEGER,
        scheduled_at TEXT NOT NULL,
        triggered INTEGER DEFAULT 0
      );
    `);
    },
};
