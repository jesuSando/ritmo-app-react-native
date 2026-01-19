import { Migration } from '../../types/Migration';

export const createBudgets: Migration = {
    name: '003_create_budgets',
    up: async (db) => {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT,
        period TEXT CHECK(period IN ('daily','weekly','monthly','yearly')) DEFAULT 'monthly',
        start_date TEXT NOT NULL,
        end_date TEXT,
        is_active INTEGER DEFAULT 1,
        spent_amount REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        account_id INTEGER,
        user_id INTEGER,
        FOREIGN KEY (account_id) REFERENCES finance_accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    },
};
