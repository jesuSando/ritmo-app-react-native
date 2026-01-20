import { Routine } from '../../types/Routine';
import { getDB } from '../database';

export const RoutineRepository = {
    async create(data: Omit<Routine, 'id' | 'created_at' | 'updated_at'>): Promise<Routine> {
        const db = getDB();
        const now = new Date().toISOString();

        const result = await db.runAsync(
            `INSERT INTO routines (
                name, days_of_week, start_time, duration,
                conflict_policy, is_active, created_at, updated_at, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            data.name,
            data.days_of_week,
            data.start_time,
            data.duration,
            data.conflict_policy,
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

    async findAllByUser(userId: number, activeOnly: boolean = true): Promise<Routine[]> {
        const db = getDB();

        let query = `SELECT * FROM routines WHERE user_id = ?`;
        const params: any[] = [userId];

        if (activeOnly) {
            query += ` AND is_active = 1`;
        }

        query += ` ORDER BY created_at DESC`;

        const rows = await db.getAllAsync<Routine>(query, ...params);

        return rows.map(row => ({
            ...row,
            is_active: row.is_active === Boolean(1),
        }));
    },

    async findById(id: number): Promise<Routine | null> {
        const db = getDB();

        const rows = await db.getAllAsync<Routine>(
            `SELECT * FROM routines WHERE id = ?`,
            id
        );

        return rows[0] ? {
            ...rows[0],
            is_active: rows[0].is_active === Boolean(1),
        } : null;
    },

    async update(id: number, updates: Partial<Routine>): Promise<void> {
        const db = getDB();
        const now = new Date().toISOString();

        const fields = [];
        const values = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.days_of_week !== undefined) {
            fields.push('days_of_week = ?');
            values.push(updates.days_of_week);
        }
        if (updates.start_time !== undefined) {
            fields.push('start_time = ?');
            values.push(updates.start_time);
        }
        if (updates.duration !== undefined) {
            fields.push('duration = ?');
            values.push(updates.duration);
        }
        if (updates.conflict_policy !== undefined) {
            fields.push('conflict_policy = ?');
            values.push(updates.conflict_policy);
        }
        if (updates.is_active !== undefined) {
            fields.push('is_active = ?');
            values.push(updates.is_active ? 1 : 0);
        }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(
            `UPDATE routines SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
    },

    async delete(id: number): Promise<void> {
        const db = getDB();
        await db.runAsync(`DELETE FROM routines WHERE id = ?`, id);
    },

    async getRoutinesForDay(userId: number, dayOfWeek: number): Promise<Routine[]> {
        const db = getDB();

        const rows = await db.getAllAsync<Routine>(
            `SELECT * FROM routines 
             WHERE user_id = ? 
             AND is_active = 1
             AND days_of_week LIKE ? 
             ORDER BY start_time ASC`,
            userId, `%${dayOfWeek}%`
        );

        return rows.map(row => ({
            ...row,
            is_active: row.is_active === Boolean(1),
        }));
    },

    async toggleActive(id: number): Promise<void> {
        const db = getDB();

        await db.runAsync(
            `UPDATE routines 
             SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
                 updated_at = ?
             WHERE id = ?`,
            new Date().toISOString(), id
        );
    },
};