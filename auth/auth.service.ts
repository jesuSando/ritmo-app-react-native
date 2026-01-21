import { User } from '@/types/User'; // Importa el tipo User
import * as Crypto from 'expo-crypto';
import { SQLiteDatabase } from 'expo-sqlite';
import { createUser, findUserByEmail } from './auth.repository';
import { clearSession, saveSession } from './auth.session';

export const hashPassword = async (password: string) => {
    return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
    );
};

export const verifyPassword = async (
    password: string,
    hash: string
) => {
    const hashed = await hashPassword(password);
    return hashed === hash;
};


export const register = async (
    db: SQLiteDatabase,
    name: string,
    email: string,
    password: string
): Promise<number> => {
    const existing = await findUserByEmail(db, email);
    if (existing) throw new Error('Email ya registrado');

    const password_hash = await hashPassword(password);
    const userId = await createUser(db, {
        name,
        email,
        password_hash,
    });

    await saveSession(userId);
    return userId;
};

export const login = async (
    db: SQLiteDatabase,
    email: string,
    password: string
): Promise<User> => { // Cambiado para retornar User
    const user = await findUserByEmail(db, email);
    if (!user) throw new Error('Usuario no encontrado');

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) throw new Error('Password incorrecta');

    await saveSession(user.id);
    return user; // Retorna el usuario completo
};

export const logout = async () => {
    await clearSession();
};