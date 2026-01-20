import { LifeNote } from '../../types/LifeNote';
import { getDB } from '../database';

export const LifeNoteRepository = {
    async create(data: Omit<LifeNote, 'id' | 'created_at'>): Promise<LifeNote> {
        const db = getDB();
        const now = new Date().toISOString();

        const result = await db.runAsync(
            `INSERT INTO life_notes (title, content, mood, created_at, user_id)
             VALUES (?, ?, ?, ?, ?)`,
            data.title || null,
            data.content,
            data.mood || null,
            now,
            data.user_id
        );

        return {
            id: result.lastInsertRowId!,
            ...data,
            created_at: now,
        };
    },

    async findAllByUser(userId: number, filters?: {
        mood?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    }): Promise<LifeNote[]> {
        const db = getDB();

        let query = `SELECT * FROM life_notes WHERE user_id = ?`;
        const params: any[] = [userId];

        if (filters) {
            if (filters.mood) {
                query += ` AND mood = ?`;
                params.push(filters.mood);
            }
            if (filters.startDate) {
                query += ` AND date(created_at) >= ?`;
                params.push(filters.startDate);
            }
            if (filters.endDate) {
                query += ` AND date(created_at) <= ?`;
                params.push(filters.endDate);
            }
            if (filters.search) {
                query += ` AND (title LIKE ? OR content LIKE ?)`;
                params.push(`%${filters.search}%`);
                params.push(`%${filters.search}%`);
            }
        }

        query += ` ORDER BY created_at DESC`;

        return await db.getAllAsync<LifeNote>(query, ...params);
    },

    async findById(id: number): Promise<LifeNote | null> {
        const db = getDB();

        const rows = await db.getAllAsync<LifeNote>(
            `SELECT * FROM life_notes WHERE id = ?`,
            id
        );

        return rows[0] || null;
    },

    async findByDate(userId: number, date: string): Promise<LifeNote | null> {
        const db = getDB();

        const rows = await db.getAllAsync<LifeNote>(
            `SELECT * FROM life_notes 
             WHERE user_id = ? 
             AND date(created_at) = date(?)`,
            userId, date
        );

        return rows[0] || null;
    },

    async update(id: number, updates: Partial<LifeNote>): Promise<void> {
        const db = getDB();

        const fields = [];
        const values = [];

        if (updates.title !== undefined) {
            fields.push('title = ?');
            values.push(updates.title);
        }
        if (updates.content !== undefined) {
            fields.push('content = ?');
            values.push(updates.content);
        }
        if (updates.mood !== undefined) {
            fields.push('mood = ?');
            values.push(updates.mood);
        }

        values.push(id);

        await db.runAsync(
            `UPDATE life_notes SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
    },

    async delete(id: number): Promise<void> {
        const db = getDB();
        await db.runAsync(`DELETE FROM life_notes WHERE id = ?`, id);
    },

    async getMoodStats(userId: number, startDate?: string, endDate?: string): Promise<Array<{ mood: string; count: number }>> {
        const db = getDB();

        let query = `
            SELECT mood, COUNT(*) as count 
            FROM life_notes 
            WHERE user_id = ? AND mood IS NOT NULL
        `;
        const params: any[] = [userId];

        if (startDate) {
            query += ` AND date(created_at) >= ?`;
            params.push(startDate);
        }
        if (endDate) {
            query += ` AND date(created_at) <= ?`;
            params.push(endDate);
        }

        query += ` GROUP BY mood ORDER BY count DESC`;

        return await db.getAllAsync<{ mood: string; count: number }>(query, ...params);
    },

    async getMonthlyNoteCount(userId: number, year: number, month: number): Promise<number> {
        const db = getDB();

        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

        const result = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count 
             FROM life_notes 
             WHERE user_id = ? 
             AND date(created_at) >= ? 
             AND date(created_at) <= ?`,
            userId, startDate, endDate
        );

        return result?.count || 0;
    },
};