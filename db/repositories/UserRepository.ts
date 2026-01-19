import { User } from '../../types/User';
import { getDB } from '../database';

export const UserRepository = {
    async create(data: Omit<User, 'id'>): Promise<User> {
        const db = getDB();

        const result = await db.runAsync(
            `INSERT INTO users (name, email, created_at)
       VALUES (?, ?, ?)`,
            data.name,
            data.email,
            data.created_at
        );

        return {
            id: result.lastInsertRowId!,
            ...data,
        };
    },

    async findAll(): Promise<User[]> {
        const db = getDB();

        const rows = await db.getAllAsync<User>(
            `SELECT * FROM users ORDER BY created_at DESC`
        );

        return rows;
    },

    async findById(id: number): Promise<User | null> {
        const db = getDB();

        const rows = await db.getAllAsync<User>(
            `SELECT * FROM users WHERE id = ?`,
            id
        );

        return rows[0] ?? null;
    },

    async delete(id: number): Promise<void> {
        const db = getDB();

        await db.runAsync(
            `DELETE FROM users WHERE id = ?`,
            id
        );
    },
};
