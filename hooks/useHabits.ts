import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { HabitLogRepository } from '../db/repositories/HabitLogRepository';
import { RoutineRepository } from '../db/repositories/RoutineRepository';
import { Routine } from '../types/Routine';

export function useHabits() {
    const { user } = useAuth();
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [todayHabits, setTodayHabits] = useState<Array<{
        routine_id: number;
        routine_name: string;
        start_time: string;
        duration: number;
        completed: boolean;
        notes?: string;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadHabits = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const today = new Date().toISOString().split('T')[0];

            const [routinesData, todayHabitsData] = await Promise.all([
                RoutineRepository.findAllByUser(user.id, true),
                HabitLogRepository.findHabitsForDate(user.id, today),
            ]);

            setRoutines(routinesData);
            setTodayHabits(todayHabitsData);
        } catch (err) {
            console.error(err);
            setError('Error cargando hábitos');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const createRoutine = useCallback(async (
        name: string,
        daysOfWeek: string,
        startTime: string,
        duration: number
    ) => {
        if (!user?.id) return;

        try {
            setError(null);

            await RoutineRepository.create({
                name,
                days_of_week: daysOfWeek,
                start_time: startTime,
                duration,
                conflict_policy: 'skip',
                is_active: true,
                user_id: user.id,
            });

            await loadHabits();
        } catch (err) {
            console.error(err);
            setError('Error creando rutina');
            throw err;
        }
    }, [user?.id, loadHabits]);

    const logHabit = useCallback(async (
        routineId: number,
        completed: boolean,
        notes?: string
    ) => {
        try {
            setError(null);

            const today = new Date().toISOString().split('T')[0];
            const existingLog = await HabitLogRepository.findByRoutineAndDate(routineId, today);

            if (existingLog) {
                await HabitLogRepository.update(existingLog.id, { completed, notes });
            } else {
                await HabitLogRepository.create({
                    routine_id: routineId,
                    date: today,
                    completed,
                    notes,
                });
            }

            await loadHabits();
        } catch (err) {
            console.error(err);
            setError('Error registrando hábito');
        }
    }, [loadHabits]);

    const toggleRoutine = useCallback(async (id: number) => {
        try {
            setError(null);
            await RoutineRepository.toggleActive(id);
            await loadHabits();
        } catch (err) {
            console.error(err);
            setError('Error alternando rutina');
        }
    }, [loadHabits]);

    const getStreak = useCallback(async (routineId: number): Promise<number> => {
        try {
            return await HabitLogRepository.getStreak(routineId);
        } catch (err) {
            console.error(err);
            return 0;
        }
    }, []);

    useEffect(() => {
        loadHabits();
    }, [loadHabits]);

    return {
        routines,
        todayHabits,
        loading,
        error,
        refresh: loadHabits,
        createRoutine,
        logHabit,
        toggleRoutine,
        getStreak,
    };
}