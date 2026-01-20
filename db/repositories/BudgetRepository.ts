import { Budget } from '../../types/Budget';
import { getDB } from '../database';

export const BudgetRepository = {
    async create(data: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'spent_amount'>): Promise<Budget> {
        const db = getDB();
        const now = new Date().toISOString();

        const result = await db.runAsync(
            `INSERT INTO budgets (
                name, amount, category, period, start_date, end_date,
                is_active, spent_amount, created_at, updated_at,
                account_id, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            data.name,
            data.amount,
            data.category || null,
            data.period,
            data.start_date,
            data.end_date || null,
            data.is_active ? 1 : 0,
            0, // spent_amount inicial
            now,
            now,
            data.account_id || null,
            data.user_id
        );

        return {
            id: result.lastInsertRowId!,
            ...data,
            spent_amount: 0,
            created_at: now,
            updated_at: now,
        };
    },

    async findAllByUser(userId: number, activeOnly: boolean = true): Promise<Budget[]> {
        const db = getDB();

        let query = `SELECT * FROM budgets WHERE user_id = ?`;
        const params: any[] = [userId];

        if (activeOnly) {
            query += ` AND is_active = 1`;
        }

        query += ` ORDER BY start_date DESC`;

        const rows = await db.getAllAsync<Budget>(query, ...params);

        return rows.map(row => ({
            ...row,
            is_active: row.is_active === Boolean(1),
        }));
    },

    async findById(id: number): Promise<Budget | null> {
        const db = getDB();

        const rows = await db.getAllAsync<Budget>(
            `SELECT * FROM budgets WHERE id = ?`,
            id
        );

        return rows[0] ? {
            ...rows[0],
            is_active: rows[0].is_active === Boolean(1),
        } : null;
    },

    async update(id: number, updates: Partial<Budget>): Promise<void> {
        const db = getDB();
        const now = new Date().toISOString();

        const fields = [];
        const values = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.amount !== undefined) {
            fields.push('amount = ?');
            values.push(updates.amount);
        }
        if (updates.category !== undefined) {
            fields.push('category = ?');
            values.push(updates.category);
        }
        if (updates.period !== undefined) {
            fields.push('period = ?');
            values.push(updates.period);
        }
        if (updates.is_active !== undefined) {
            fields.push('is_active = ?');
            values.push(updates.is_active ? 1 : 0);
        }
        if (updates.spent_amount !== undefined) {
            fields.push('spent_amount = ?');
            values.push(updates.spent_amount);
        }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(
            `UPDATE budgets SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
    },

    async delete(id: number): Promise<void> {
        const db = getDB();
        await db.runAsync(`DELETE FROM budgets WHERE id = ?`, id);
    },

    async getActiveBudgetsForPeriod(userId: number, date: string): Promise<Budget[]> {
        const db = getDB();

        const rows = await db.getAllAsync<Budget>(
            `SELECT * FROM budgets 
             WHERE user_id = ? 
             AND is_active = 1
             AND start_date <= ?
             AND (end_date IS NULL OR end_date >= ?)
             ORDER BY period, category`,
            userId, date, date
        );

        return rows.map(row => ({
            ...row,
            is_active: row.is_active === Boolean(1),
        }));
    },

    async updateSpentAmount(budgetId: number): Promise<void> {
        const db = getDB();

        await db.runAsync(
            `UPDATE budgets 
             SET spent_amount = (
                 SELECT COALESCE(SUM(amount), 0)
                 FROM transactions 
                 WHERE budget_id = ? 
                 AND type = 'expense'
                 AND is_confirmed = 1
             )
             WHERE id = ?`,
            budgetId, budgetId
        );
    },
};