import { SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { initDB } from './database';

export const useDatabase = () => {
    const [db, setDb] = useState<SQLiteDatabase | null>(null);

    useEffect(() => {
        initDB().then(setDb);
    }, []);

    return db;
};
