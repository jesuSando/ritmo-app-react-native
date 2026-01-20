import { Task, TaskPriority, TaskStatus } from '../../types/Task';
import { getDB } from '../database';

export const TaskRepository = {
    async create(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
        const db = getDB();
        const now = new Date().toISOString();

        const result = await db.runAsync(
            `INSERT INTO tasks (
                title, description, start_time, end_time,
                allow_overlap, status, priority, created_at, updated_at,
                origin_routine_id, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            data.title,
            data.description || null,
            data.start_time,
            data.end_time,
            data.allow_overlap ? 1 : 0,
            data.status,
            data.priority,
            now,
            now,
            data.origin_routine_id || null,
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
        status?: TaskStatus;
        date?: string;
        priority?: TaskPriority;
    }): Promise<Task[]> {
        const db = getDB();

        let query = `SELECT * FROM tasks WHERE user_id = ?`;
        const params: any[] = [userId];

        if (filters) {
            if (filters.status) {
                query += ` AND status = ?`;
                params.push(filters.status);
            }
            if (filters.date) {
                query += ` AND date(start_time) = date(?)`;
                params.push(filters.date);
            }
            if (filters.priority) {
                query += ` AND priority = ?`;
                params.push(filters.priority);
            }
        }

        query += ` ORDER BY start_time ASC`;

        const rows = await db.getAllAsync<Task>(query, ...params);

        return rows.map(row => ({
            ...row,
            allow_overlap: row.allow_overlap === Boolean(1),
        }));
    },

    async findTodayTasks(userId: number): Promise<Task[]> {
        const db = getDB();
        const today = new Date().toISOString().split('T')[0];

        const rows = await db.getAllAsync<Task>(
            `SELECT * FROM tasks 
             WHERE user_id = ? 
             AND date(start_time) = date(?)
             AND status = 'pending'
             ORDER BY 
                CASE priority 
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                END,
                start_time ASC`,
            userId, today
        );

        return rows.map(row => ({
            ...row,
            allow_overlap: row.allow_overlap === Boolean(1),
        }));
    },

    async findById(id: number): Promise<Task | null> {
        const db = getDB();

        const rows = await db.getAllAsync<Task>(
            `SELECT * FROM tasks WHERE id = ?`,
            id
        );

        return rows[0] ? {
            ...rows[0],
            allow_overlap: rows[0].allow_overlap === Boolean(1),
        } : null;
    },

    async update(id: number, updates: Partial<Task>): Promise<void> {
        const db = getDB();
        const now = new Date().toISOString();

        const fields = [];
        const values = [];

        if (updates.title !== undefined) {
            fields.push('title = ?');
            values.push(updates.title);
        }
        if (updates.description !== undefined) {
            fields.push('description = ?');
            values.push(updates.description);
        }
        if (updates.start_time !== undefined) {
            fields.push('start_time = ?');
            values.push(updates.start_time);
        }
        if (updates.end_time !== undefined) {
            fields.push('end_time = ?');
            values.push(updates.end_time);
        }
        if (updates.status !== undefined) {
            fields.push('status = ?');
            values.push(updates.status);
        }
        if (updates.priority !== undefined) {
            fields.push('priority = ?');
            values.push(updates.priority);
        }
        if (updates.allow_overlap !== undefined) {
            fields.push('allow_overlap = ?');
            values.push(updates.allow_overlap ? 1 : 0);
        }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(
            `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
    },

    async delete(id: number): Promise<void> {
        const db = getDB();
        await db.runAsync(`DELETE FROM tasks WHERE id = ?`, id);
    },

    async completeTask(id: number): Promise<void> {
        const db = getDB();
        const now = new Date().toISOString();

        await db.runAsync(
            `UPDATE tasks SET status = 'completed', updated_at = ? WHERE id = ?`,
            now, id
        );
    },

    async getTaskStats(userId: number): Promise<{
        total: number;
        completed: number;
        pending: number;
        todayPending: number;
    }> {
        const db = getDB();
        const today = new Date().toISOString().split('T')[0];

        const totalResult = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM tasks WHERE user_id = ?`,
            userId
        );

        const completedResult = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'completed'`,
            userId
        );

        const todayPendingResult = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM tasks 
             WHERE user_id = ? 
             AND status = 'pending'
             AND date(start_time) = date(?)`,
            userId, today
        );

        return {
            total: totalResult?.count || 0,
            completed: completedResult?.count || 0,
            pending: (totalResult?.count || 0) - (completedResult?.count || 0),
            todayPending: todayPendingResult?.count || 0,
        };
    },
};