export interface HabitLog {
    id: number;
    routine_id: number;
    date: string; // YYYY-MM-DD
    completed: boolean;
    notes?: string;
}