import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { FinanceAccountRepository } from '../db/repositories/FinanceAccountRepository';
import { FinanceAccount } from '../types/FinanceAccount';

export function useFinanceAccounts() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalBalance, setTotalBalance] = useState(0);

    const loadAccounts = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const data = await FinanceAccountRepository.findAllByUser(user.id);
            setAccounts(data);

            const total = await FinanceAccountRepository.getTotalBalance(user.id);
            setTotalBalance(total);
        } catch (err) {
            console.error(err);
            setError('Error cargando cuentas');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const createAccount = useCallback(async (
        name: string,
        type: FinanceAccount['type'],
        currency: FinanceAccount['currency'],
        initialBalance: number
    ) => {
        if (!user?.id) return;

        try {
            setError(null);

            await FinanceAccountRepository.create({
                name,
                type,
                currency,
                initial_balance: initialBalance,
                current_balance: initialBalance,
                is_active: true,
                user_id: user.id,
            });

            await loadAccounts();
        } catch (err) {
            console.error(err);
            setError('Error creando cuenta');
        }
    }, [user?.id, loadAccounts]);

    const updateAccount = useCallback(async (
        id: number,
        updates: Partial<FinanceAccount>
    ) => {
        try {
            setError(null);
            await FinanceAccountRepository.update(id, updates);
            await loadAccounts();
        } catch (err) {
            console.error(err);
            setError('Error actualizando cuenta');
        }
    }, [loadAccounts]);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    return {
        accounts,
        totalBalance,
        loading,
        error,
        refresh: loadAccounts,
        createAccount,
        updateAccount,
    };
}