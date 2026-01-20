import { Transaction, TransactionType } from '../../types/Transaction';
import { getDB } from '../database';

export const TransactionRepository = {
    async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
        const db = getDB();
        const now = new Date().toISOString();

        const result = await db.runAsync(
            `INSERT INTO transactions (
                amount, type, category, description, date, 
                is_recurring, recurrence_pattern, is_confirmed,
                created_at, updated_at, account_id, budget_id, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            data.amount,
            data.type,
            data.category,
            data.description || null,
            data.date,
            data.is_recurring ? 1 : 0,
            data.recurrence_pattern || null,
            data.is_confirmed ? 1 : 0,
            now,
            now,
            data.account_id,
            data.budget_id || null,
            data.user_id
        );

        return {
            id: result.lastInsertRowId!,
            ...data,
            created_at: now,
            updated_at: now,
        };
    },

    async findAllByUser(userId: number, filters?: {
        type?: TransactionType;
        accountId?: number;
        startDate?: string;
        endDate?: string;
        category?: string;
    }): Promise<Transaction[]> {
        const db = getDB();

        let query = `SELECT * FROM transactions WHERE user_id = ?`;
        const params: any[] = [userId];

        if (filters) {
            if (filters.type) {
                query += ` AND type = ?`;
                params.push(filters.type);
            }
            if (filters.accountId) {
                query += ` AND account_id = ?`;
                params.push(filters.accountId);
            }
            if (filters.startDate) {
                query += ` AND date >= ?`;
                params.push(filters.startDate);
            }
            if (filters.endDate) {
                query += ` AND date <= ?`;
                params.push(filters.endDate);
            }
            if (filters.category) {
                query += ` AND category = ?`;
                params.push(filters.category);
            }
        }

        query += ` ORDER BY date DESC, created_at DESC`;

        const rows = await db.getAllAsync<Transaction>(query, ...params);

        return rows.map(row => ({
            ...row,
            is_recurring: row.is_recurring === Boolean(1),
            is_confirmed: row.is_confirmed === Boolean(1),
        }));
    },

    async findByAccount(accountId: number): Promise<Transaction[]> {
        const db = getDB();

        const rows = await db.getAllAsync<Transaction>(
            `SELECT * FROM transactions 
             WHERE account_id = ? 
             ORDER BY date DESC`,
            accountId
        );

        return rows.map(row => ({
            ...row,
            is_recurring: row.is_recurring === Boolean(1),
            is_confirmed: row.is_confirmed === Boolean(1),
        }));
    },

    async findById(id: number): Promise<Transaction | null> {
        const db = getDB();

        const rows = await db.getAllAsync<Transaction>(
            `SELECT * FROM transactions WHERE id = ?`,
            id
        );

        return rows[0] ? {
            ...rows[0],
            is_recurring: rows[0].is_recurring === Boolean(1),
            is_confirmed: rows[0].is_confirmed === Boolean(1),
        } : null;
    },

    async update(id: number, updates: Partial<Transaction>): Promise<void> {
        const db = getDB();
        const now = new Date().toISOString();

        const fields = [];
        const values = [];

        if (updates.amount !== undefined) {
            fields.push('amount = ?');
            values.push(updates.amount);
        }
        if (updates.type !== undefined) {
            fields.push('type = ?');
            values.push(updates.type);
        }
        if (updates.category !== undefined) {
            fields.push('category = ?');
            values.push(updates.category);
        }
        if (updates.description !== undefined) {
            fields.push('description = ?');
            values.push(updates.description);
        }
        if (updates.date !== undefined) {
            fields.push('date = ?');
            values.push(updates.date);
        }
        if (updates.is_recurring !== undefined) {
            fields.push('is_recurring = ?');
            values.push(updates.is_recurring ? 1 : 0);
        }
        if (updates.is_confirmed !== undefined) {
            fields.push('is_confirmed = ?');
            values.push(updates.is_confirmed ? 1 : 0);
        }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(
            `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
    },

    async delete(id: number): Promise<void> {
        const db = getDB();
        await db.runAsync(`DELETE FROM transactions WHERE id = ?`, id);
    },

    async getMonthlySummary(userId: number, year: number, month: number): Promise<{
        income: number;
        expense: number;
        balance: number;
    }> {
        const db = getDB();

        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

        const result = await db.getFirstAsync<{
            total_income: number;
            total_expense: number;
        }>(
            `SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
             FROM transactions 
             WHERE user_id = ? 
             AND date >= ? 
             AND date <= ?
             AND is_confirmed = 1`,
            userId, startDate, endDate
        );

        return {
            income: result?.total_income || 0,
            expense: result?.total_expense || 0,
            balance: (result?.total_income || 0) - (result?.total_expense || 0),
        };
    },

    async getCategoryTotals(userId: number, type: TransactionType, startDate?: string, endDate?: string): Promise<Array<{ category: string; total: number }>> {
        const db = getDB();

        let query = `
            SELECT category, SUM(amount) as total 
            FROM transactions 
            WHERE user_id = ? AND type = ? AND is_confirmed = 1
        `;
        const params: any[] = [userId, type];

        if (startDate) {
            query += ` AND date >= ?`;
            params.push(startDate);
        }
        if (endDate) {
            query += ` AND date <= ?`;
            params.push(endDate);
        }

        query += ` GROUP BY category ORDER BY total DESC`;

        const rows = await db.getAllAsync<{ category: string; total: number }>(query, ...params);
        return rows;
    },
};