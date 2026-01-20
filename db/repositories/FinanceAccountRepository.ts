import { FinanceAccount } from '../../types/FinanceAccount';
import { getDB } from '../database';

export const FinanceAccountRepository = {
    async create(data: Omit<FinanceAccount, 'id' | 'created_at' | 'updated_at'>): Promise<FinanceAccount> {
        const db = getDB();
        const now = new Date().toISOString();

        const result = await db.runAsync(
            `INSERT INTO finance_accounts (
                name, type, currency, initial_balance, current_balance, 
                is_active, created_at, updated_at, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            data.name,
            data.type,
            data.currency,
            data.initial_balance,
            data.current_balance,
            data.is_active ? 1 : 0,
            now,
            now,
            data.user_id
        );

        return {
            id: result.lastInsertRowId!,
            ...data,
            created_at: now,
            updated_at: now,
        };
    },

    async findAllByUser(userId: number): Promise<FinanceAccount[]> {
        const db = getDB();

        const rows = await db.getAllAsync<FinanceAccount>(
            `SELECT * FROM finance_accounts 
             WHERE user_id = ? 
             ORDER BY created_at DESC`,
            userId
        );

        return rows.map(row => ({
            ...row,
            is_active: row.is_active === Boolean(1),
        }));
    },

    async findById(id: number): Promise<FinanceAccount | null> {
        const db = getDB();

        const rows = await db.getAllAsync<FinanceAccount>(
            `SELECT * FROM finance_accounts WHERE id = ?`,
            id
        );

        return rows[0] ? {
            ...rows[0],
            is_active: rows[0].is_active === Boolean(1),
        } : null;
    },

    async update(id: number, updates: Partial<FinanceAccount>): Promise<void> {
        const db = getDB();
        const now = new Date().toISOString();

        const fields = [];
        const values = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.type !== undefined) {
            fields.push('type = ?');
            values.push(updates.type);
        }
        if (updates.current_balance !== undefined) {
            fields.push('current_balance = ?');
            values.push(updates.current_balance);
        }
        if (updates.is_active !== undefined) {
            fields.push('is_active = ?');
            values.push(updates.is_active ? 1 : 0);
        }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(
            `UPDATE finance_accounts SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
    },

    async delete(id: number): Promise<void> {
        const db = getDB();
        await db.runAsync(`DELETE FROM finance_accounts WHERE id = ?`, id);
    },

    async getTotalBalance(userId: number): Promise<number> {
        const db = getDB();

        const result = await db.getFirstAsync<{ total: number }>(
            `SELECT SUM(current_balance) as total 
             FROM finance_accounts 
             WHERE user_id = ? AND is_active = 1`,
            userId
        );

        return result?.total || 0;
    },
};