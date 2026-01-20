export type TaskStatus = 'pending' | 'completed' | 'discarded';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    allow_overlap: boolean;
    status: TaskStatus;
    priority: TaskPriority;
    created_at: string;
    updated_at: string;
    origin_routine_id?: number;
    user_id: number;
}