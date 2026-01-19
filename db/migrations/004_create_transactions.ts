import { Migration } from '../../types/Migration';

export const createTransactions: Migration = {
    name: '004_create_transactions',
    up: async (db) => {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        type TEXT CHECK(type IN ('income','expense','transfer')) NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        is_recurring INTEGER DEFAULT 0,
        recurrence_pattern TEXT,
        is_confirmed INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        account_id INTEGER,
        budget_id INTEGER,
        user_id INTEGER,
        FOREIGN KEY (account_id) REFERENCES finance_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    },
};
