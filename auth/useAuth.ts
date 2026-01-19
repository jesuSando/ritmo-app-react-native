import { useEffect, useState } from 'react';
import { clearSession, getSession } from './auth.session';

export const useAuth = () => {
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSession().then((session) => {
            setUserId(session?.userId ?? null);
            setLoading(false);
        });
    }, []);

    return {
        userId,
        isAuthenticated: !!userId,
        loading,
        logout: async () => {
            await clearSession();
            setUserId(null);
        },
    };
};
