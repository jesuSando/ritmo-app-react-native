import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function AppLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: '#7870e6',
                tabBarInactiveTintColor: '#6b7280',
                tabBarStyle: {
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="finances"
                options={{
                    title: 'Finanzas',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="wallet" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="tasks"
                options={{
                    title: 'Tareas',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="checkmark-circle" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="habits"
                options={{
                    title: 'Hábitos',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="repeat" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="notes"
                options={{
                    title: 'Notas',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="journal" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}