import { User } from '@/types/User';
import { useEffect, useState } from 'react';
import { getDB } from '../db/database';
import { findUserById } from './auth.repository';
import { clearSession, getSession } from './auth.session';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const session = await getSession();
            if (session?.userId) {
                try {
                    const db = getDB();
                    const userData = await findUserById(db, session.userId);
                    if (userData) {
                        setUser(userData);
                    } else {
                        await clearSession();
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error cargando usuario:', error);
                    await clearSession();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    return {
        user,
        userId: user?.id ?? null,
        isAuthenticated: !!user?.id,
        loading,
        logout: async () => {
            await clearSession();
            setUser(null);
        },
        updateUser: (userData: User | null) => {
            setUser(userData);
        }
    };
};