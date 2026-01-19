import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'auth_session';

export const saveSession = async (userId: number) => {
    await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ userId })
    );
};

export const getSession = async () => {
    const data = await AsyncStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
};

export const clearSession = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
};
