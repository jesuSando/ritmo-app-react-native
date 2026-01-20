export type ConflictPolicy = 'skip' | 'push' | 'notify' | 'force';

export interface Routine {
    id: number;
    name: string;
    days_of_week: string; // "1,2,3,4,5" para Lunes-Viernes
    start_time: string; // "09:00"
    duration: number; // en minutos
    conflict_policy: ConflictPolicy;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user_id: number;
}