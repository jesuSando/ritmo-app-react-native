import { SQLiteDatabase } from 'expo-sqlite';

export interface Migration {
    name: string;
    up: (db: SQLiteDatabase) => Promise<void>;
}
