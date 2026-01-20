import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { TransactionRepository } from '../db/repositories/TransactionRepository';
import { Transaction, TransactionType } from '../types/Transaction';

export function useTransactions(filters?: {
    type?: TransactionType;
    accountId?: number;
    startDate?: string;
    endDate?: string;
    category?: string;
}) {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [monthlySummary, setMonthlySummary] = useState<{
        income: number;
        expense: number;
        balance: number;
    }>({ income: 0, expense: 0, balance: 0 });

    const loadTransactions = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const now = new Date();
            const data = await TransactionRepository.findAllByUser(user.id, filters);
            setTransactions(data);

            // Cargar resumen del mes actual
            const summary = await TransactionRepository.getMonthlySummary(
                user.id,
                now.getFullYear(),
                now.getMonth() + 1
            );
            setMonthlySummary(summary);
        } catch (err) {
            console.error(err);
            setError('Error cargando transacciones');
        } finally {
            setLoading(false);
        }
    }, [user?.id, JSON.stringify(filters)]);

    const createTransaction = useCallback(async (
        amount: number,
        type: TransactionType,
        category: string,
        date: string,
        accountId: number,
        description?: string
    ) => {
        if (!user?.id) return;

        try {
            setError(null);

            await TransactionRepository.create({
                amount,
                type,
                category,
                description,
                date,
                is_recurring: false,
                is_confirmed: true,
                account_id: accountId,
                user_id: user.id,
            });

            await loadTransactions();
        } catch (err) {
            console.error(err);
            setError('Error creando transacción');
            throw err;
        }
    }, [user?.id, loadTransactions]);

    const deleteTransaction = useCallback(async (id: number) => {
        try {
            setError(null);
            await TransactionRepository.delete(id);
            await loadTransactions();
        } catch (err) {
            console.error(err);
            setError('Error eliminando transacción');
        }
    }, [loadTransactions]);

    const getCategoryTotals = useCallback(async (type: TransactionType) => {
        if (!user?.id) return [];

        try {
            return await TransactionRepository.getCategoryTotals(user.id, type);
        } catch (err) {
            console.error(err);
            return [];
        }
    }, [user?.id]);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    return {
        transactions,
        monthlySummary,
        loading,
        error,
        refresh: loadTransactions,
        createTransaction,
        deleteTransaction,
        getCategoryTotals,
    };
}