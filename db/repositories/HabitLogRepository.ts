import { HabitLog } from '../../types/HabitLog';
import { getDB } from '../database';

export const HabitLogRepository = {
    async create(data: Omit<HabitLog, 'id'>): Promise<HabitLog> {
        const db = getDB();

        const result = await db.runAsync(
            `INSERT INTO habit_logs (routine_id, date, completed, notes)
             VALUES (?, ?, ?, ?)`,
            data.routine_id,
            data.date,
            data.completed ? 1 : 0,
            data.notes || null
        );

        return {
            id: result.lastInsertRowId!,
            ...data,
        };
    },

    async findByRoutineAndDate(routineId: number, date: string): Promise<HabitLog | null> {
        const db = getDB();

        const rows = await db.getAllAsync<HabitLog>(
            `SELECT * FROM habit_logs 
             WHERE routine_id = ? AND date = ?`,
            routineId, date
        );

        return rows[0] ? {
            ...rows[0],
            completed: rows[0].completed === Boolean(1),
        } : null;
    },

    async findHabitsForDate(userId: number, date: string): Promise<Array<{
        routine_id: number;
        routine_name: string;
        start_time: string;
        duration: number;
        completed: boolean;
        notes?: string;
    }>> {
        const db = getDB();

        const dayOfWeek = new Date(date).getDay(); // 0 = Domingo, 1 = Lunes, etc.

        const rows = await db.getAllAsync<{
            routine_id: number;
            routine_name: string;
            start_time: string;
            duration: number;
            completed: number;
            notes?: string;
        }>(
            `SELECT 
                r.id as routine_id,
                r.name as routine_name,
                r.start_time,
                r.duration,
                COALESCE(hl.completed, 0) as completed,
                hl.notes
             FROM routines r
             LEFT JOIN habit_logs hl ON hl.routine_id = r.id AND hl.date = ?
             WHERE r.user_id = ? 
             AND r.is_active = 1
             AND r.days_of_week LIKE ?
             ORDER BY r.start_time ASC`,
            date, userId, `%${dayOfWeek}%`
        );

        return rows.map(row => ({
            routine_id: row.routine_id,
            routine_name: row.routine_name,
            start_time: row.start_time,
            duration: row.duration,
            completed: row.completed === 1,
            notes: row.notes,
        }));
    },

    async update(id: number, updates: Partial<HabitLog>): Promise<void> {
        const db = getDB();

        const fields = [];
        const values = [];

        if (updates.completed !== undefined) {
            fields.push('completed = ?');
            values.push(updates.completed ? 1 : 0);
        }
        if (updates.notes !== undefined) {
            fields.push('notes = ?');
            values.push(updates.notes);
        }

        values.push(id);

        await db.runAsync(
            `UPDATE habit_logs SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
    },

    async getStreak(routineId: number): Promise<number> {
        const db = getDB();

        const result = await db.getFirstAsync<{ streak: number }>(
            `WITH RECURSIVE dates AS (
                SELECT date(?,'-1 day') as log_date
                UNION ALL
                SELECT date(log_date,'-1 day') 
                FROM dates 
                WHERE date(log_date) >= date(?,'-30 day')
            )
            SELECT COUNT(*) as streak
            FROM dates d
            WHERE EXISTS (
                SELECT 1 FROM habit_logs hl 
                WHERE hl.routine_id = ? 
                AND hl.date = d.log_date 
                AND hl.completed = 1
            )
            AND NOT EXISTS (
                SELECT 1 FROM habit_logs hl 
                WHERE hl.routine_id = ? 
                AND hl.date = d.log_date 
                AND hl.completed = 0
            )`,
            new Date().toISOString().split('T')[0],
            new Date().toISOString().split('T')[0],
            routineId,
            routineId
        );

        return result?.streak || 0;
    },

    async getMonthlyStats(routineId: number, year: number, month: number): Promise<{
        completed: number;
        total: number;
        completionRate: number;
    }> {
        const db = getDB();

        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

        const result = await db.getFirstAsync<{
            completed: number;
            total_days: number;
        }>(
            `SELECT 
                COALESCE(SUM(CASE WHEN hl.completed = 1 THEN 1 ELSE 0 END), 0) as completed,
                COUNT(DISTINCT d.date) as total_days
             FROM (
                 SELECT date(?, '+' || (value-1) || ' days') as date
                 FROM json_each(json_array(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30))
                 WHERE date <= date(?)
             ) d
             LEFT JOIN habit_logs hl ON hl.date = d.date AND hl.routine_id = ?
             LEFT JOIN routines r ON r.id = hl.routine_id
             WHERE strftime('%w', d.date) IN (
                 SELECT value FROM json_each('[' || replace(r.days_of_week, ',', ',') || ']')
             ) OR hl.routine_id IS NOT NULL`,
            startDate, endDate, routineId
        );

        const completed = result?.completed || 0;
        const total = result?.total_days || 0;

        return {
            completed,
            total,
            completionRate: total > 0 ? (completed / total) * 100 : 0,
        };
    },
};