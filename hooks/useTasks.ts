import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { TaskRepository } from '../db/repositories/TaskRepository';
import { Task, TaskPriority, TaskStatus } from '../types/Task';

export function useTasks(filters?: {
    status?: TaskStatus;
    date?: string;
    priority?: TaskPriority;
}) {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [todayTasks, setTodayTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<{
        total: number;
        completed: number;
        pending: number;
        todayPending: number;
    }>({ total: 0, completed: 0, pending: 0, todayPending: 0 });

    const loadTasks = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const [allTasks, todayTasksData, taskStats] = await Promise.all([
                TaskRepository.findAllByUser(user.id, filters),
                TaskRepository.findTodayTasks(user.id),
                TaskRepository.getTaskStats(user.id),
            ]);

            setTasks(allTasks);
            setTodayTasks(todayTasksData);
            setStats(taskStats);
        } catch (err) {
            console.error(err);
            setError('Error cargando tareas');
        } finally {
            setLoading(false);
        }
    }, [user?.id, JSON.stringify(filters)]);

    const createTask = useCallback(async (
        title: string,
        startTime: string,
        endTime: string,
        priority: TaskPriority = 'medium'
    ) => {
        if (!user?.id) return;

        try {
            setError(null);

            await TaskRepository.create({
                title,
                start_time: startTime,
                end_time: endTime,
                allow_overlap: false,
                status: 'pending',
                priority,
                user_id: user.id,
            });

            await loadTasks();
        } catch (err) {
            console.error(err);
            setError('Error creando tarea');
            throw err;
        }
    }, [user?.id, loadTasks]);

    const completeTask = useCallback(async (id: number) => {
        try {
            setError(null);
            await TaskRepository.completeTask(id);
            await loadTasks();
        } catch (err) {
            console.error(err);
            setError('Error completando tarea');
        }
    }, [loadTasks]);

    const updateTask = useCallback(async (id: number, updates: Partial<Task>) => {
        try {
            setError(null);
            await TaskRepository.update(id, updates);
            await loadTasks();
        } catch (err) {
            console.error(err);
            setError('Error actualizando tarea');
        }
    }, [loadTasks]);

    const deleteTask = useCallback(async (id: number) => {
        try {
            setError(null);
            await TaskRepository.delete(id);
            await loadTasks();
        } catch (err) {
            console.error(err);
            setError('Error eliminando tarea');
        }
    }, [loadTasks]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    return {
        tasks,
        todayTasks,
        stats,
        loading,
        error,
        refresh: loadTasks,
        createTask,
        completeTask,
        updateTask,
        deleteTask,
    };
}