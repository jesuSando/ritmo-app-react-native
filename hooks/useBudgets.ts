import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { BudgetRepository } from '../db/repositories/BudgetRepository';
import { Budget, BudgetPeriod } from '../types/Budget';

export function useBudgets() {
    const { user } = useAuth();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadBudgets = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const data = await BudgetRepository.findAllByUser(user.id);
            setBudgets(data);
        } catch (err) {
            console.error(err);
            setError('Error cargando presupuestos');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const createBudget = useCallback(async (
        name: string,
        amount: number,
        period: BudgetPeriod,
        startDate: string,
        endDate?: string,
        category?: string,
        accountId?: number
    ) => {
        if (!user?.id) {
            throw new Error('Usuario no autenticado');
        }

        if (!name.trim()) {
            throw new Error('El nombre del presupuesto es requerido');
        }

        if (amount <= 0) {
            throw new Error('El monto debe ser mayor a 0');
        }

        try {
            setError(null);

            await BudgetRepository.create({
                name: name.trim(),
                amount,
                category: category || null,
                period,
                start_date: startDate,
                end_date: endDate || null,
                is_active: true,
                account_id: accountId || null,
                user_id: user.id,
            });

            await loadBudgets();
        } catch (err) {
            console.error(err);
            setError('Error creando presupuesto');
            throw err;
        }
    }, [user?.id, loadBudgets]);

    const updateBudget = useCallback(async (
        id: number,
        updates: Partial<Budget>
    ) => {
        try {
            setError(null);
            await BudgetRepository.update(id, updates);
            await loadBudgets();
        } catch (err) {
            console.error(err);
            setError('Error actualizando presupuesto');
            throw err;
        }
    }, [loadBudgets]);

    const deleteBudget = useCallback(async (id: number) => {
        try {
            setError(null);
            await BudgetRepository.delete(id);
            await loadBudgets();
        } catch (err) {
            console.error(err);
            setError('Error eliminando presupuesto');
            throw err;
        }
    }, [loadBudgets]);

    const toggleBudgetStatus = useCallback(async (id: number, currentStatus: boolean) => {
        try {
            await updateBudget(id, { is_active: !currentStatus });
        } catch (err) {
            throw err;
        }
    }, [updateBudget]);

    const updateBudgetsSpentAmount = useCallback(async () => {
        if (!user?.id) return;

        try {
            // Para cada presupuesto, actualizar el spent_amount
            const activeBudgets = budgets.filter(b => b.is_active);
            for (const budget of activeBudgets) {
                await BudgetRepository.updateSpentAmount(budget.id);
            }

            // Recargar budgets sin llamar a loadBudgets (para evitar loop)
            const updatedBudgets = await BudgetRepository.findAllByUser(user.id);
            setBudgets(updatedBudgets);
        } catch (err) {
            console.error('Error actualizando montos gastados:', err);
        }
    }, [user?.id, budgets]);
    const getBudgetProgress = useCallback((budget: Budget) => {
        if (budget.amount <= 0) return 0;
        return Math.min((budget.spent_amount / budget.amount) * 100, 100);
    }, []);

    const getBudgetStatus = useCallback((budget: Budget) => {
        const progress = getBudgetProgress(budget);
        if (progress >= 100) return 'exceeded';
        if (progress >= 80) return 'warning';
        return 'good';
    }, [getBudgetProgress]);

    useEffect(() => {
        loadBudgets();
    }, [loadBudgets]);

    useEffect(() => {
        const updateSpentAmounts = async () => {
            if (!user?.id || budgets.length === 0) return;

            try {
                const activeBudgets = budgets.filter(b => b.is_active);
                for (const budget of activeBudgets) {
                    await BudgetRepository.updateSpentAmount(budget.id);
                }

                const updatedBudgets = await BudgetRepository.findAllByUser(user.id);
                setBudgets(updatedBudgets);
            } catch (err) {
                console.error('Error actualizando montos gastados:', err);
            }
        };

        if (budgets.length > 0) {
            updateSpentAmounts();
        }

        const interval = setInterval(() => {
            if (budgets.some(b => b.is_active)) {
                updateSpentAmounts();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [user?.id, budgets.length]);

    return {
        budgets,
        loading,
        error,
        refresh: loadBudgets,
        createBudget,
        updateBudget,
        deleteBudget,
        toggleBudgetStatus,
        getBudgetProgress,
        getBudgetStatus,
        updateBudgetsSpentAmount,
    };
}