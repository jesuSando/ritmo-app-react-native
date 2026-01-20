import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { LifeNoteRepository } from '../db/repositories/LifeNoteRepository';
import { LifeNote } from '../types/LifeNote';

export function useLifeNotes(filters?: {
    mood?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}) {
    const { user } = useAuth();
    const [notes, setNotes] = useState<LifeNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [moodStats, setMoodStats] = useState<Array<{ mood: string; count: number }>>([]);

    const loadNotes = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const [notesData, statsData] = await Promise.all([
                LifeNoteRepository.findAllByUser(user.id, filters),
                LifeNoteRepository.getMoodStats(user.id),
            ]);

            setNotes(notesData);
            setMoodStats(statsData);
        } catch (err) {
            console.error(err);
            setError('Error cargando notas');
        } finally {
            setLoading(false);
        }
    }, [user?.id, JSON.stringify(filters)]);

    const createNote = useCallback(async (
        content: string,
        title?: string,
        mood?: string
    ) => {
        if (!user?.id) return;

        try {
            setError(null);

            await LifeNoteRepository.create({
                title,
                content,
                mood,
                user_id: user.id,
            });

            await loadNotes();
        } catch (err) {
            console.error(err);
            setError('Error creando nota');
            throw err;
        }
    }, [user?.id, loadNotes]);

    const getNoteForToday = useCallback(async (): Promise<LifeNote | null> => {
        if (!user?.id) return null;

        try {
            const today = new Date().toISOString().split('T')[0];
            return await LifeNoteRepository.findByDate(user.id, today);
        } catch (err) {
            console.error(err);
            return null;
        }
    }, [user?.id]);

    const updateNote = useCallback(async (id: number, updates: Partial<LifeNote>) => {
        try {
            setError(null);
            await LifeNoteRepository.update(id, updates);
            await loadNotes();
        } catch (err) {
            console.error(err);
            setError('Error actualizando nota');
        }
    }, [loadNotes]);

    const deleteNote = useCallback(async (id: number) => {
        try {
            setError(null);
            await LifeNoteRepository.delete(id);
            await loadNotes();
        } catch (err) {
            console.error(err);
            setError('Error eliminando nota');
        }
    }, [loadNotes]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    return {
        notes,
        moodStats,
        loading,
        error,
        refresh: loadNotes,
        createNote,
        getNoteForToday,
        updateNote,
        deleteNote,
    };
}