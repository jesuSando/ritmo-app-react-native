import { Migration } from '../../types/Migration';

export const createFinanceAccounts: Migration = {
    name: '002_create_finance_accounts',
    up: async (db) => {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS finance_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('cash','bank_account','credit_card','digital_wallet','savings')) DEFAULT 'bank_account',
        currency TEXT CHECK(currency IN ('CLP','USD','UF')) DEFAULT 'CLP',
        initial_balance REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    },
};
