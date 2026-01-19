import { SQLiteDatabase } from 'expo-sqlite';

export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
}

export const createUser = async (
    db: SQLiteDatabase,
    user: Omit<User, 'id'>
) => {
    const result = await db.runAsync(
        `
    INSERT INTO users (name, email, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    `,
        [
            user.name,
            user.email,
            user.password_hash,
            new Date().toISOString(),
            new Date().toISOString(),
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
