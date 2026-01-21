import { User } from '@/types/User';
import { SQLiteDatabase } from 'expo-sqlite';

export const createUser = async (
    db: SQLiteDatabase,
    user: Omit<User, 'id' | 'created_at' | 'updated_at'>
) => {
    const now = new Date().toISOString();
    const result = await db.runAsync(
        `
    INSERT INTO users (name, email, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    `,
        [
            user.name,
            user.email,
            user.password_hash,
            now,
            now
        ]
    );

    return result.lastInsertRowId;
};

export const findUserByEmail = async (
    db: SQLiteDatabase,
    email: string
) => {
    return await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
};

export const findUserById = async (
    db: SQLiteDatabase,
    id: number
) => {
    return await db.getFirstAsync<User>(
        'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?',
        [id]
    );
};