import { useCallback, useEffect, useState } from 'react';
import { UserRepository } from '../db/repositories/UserRepository';
import { User } from '../types/User';

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await UserRepository.findAll();
            setUsers(data);
        } catch (err) {
            console.error(err);
            setError('Error cargando usuarios');
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(
        async (name: string, email: string) => {
            try {
                setError(null);

                const user = await UserRepository.create({
                    name,
                    email,
                    created_at: new Date().toISOString(),
                });

                setUsers(prev => [user, ...prev]);
            } catch (err) {
                console.error(err);
                setError('Error creando usuario');
            }
        },
        []
    );

    const deleteUser = useCallback(async (id: number) => {
        try {
            setError(null);

            await UserRepository.delete(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            console.error(err);
            setError('Error eliminando usuario');
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    return {
        users,
        loading,
        error,
        refresh: loadUsers,
        createUser,
        deleteUser,
    };
}
