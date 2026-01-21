import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { StyleSheet } from 'react-native';
import { useAuth } from '../../auth/useAuth';

type TabProps = {
    color: string;
    size: number;
    focused: boolean;
}

export default function AppLayout() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#7870e6',
                tabBarInactiveTintColor: '#6b7280',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopColor: '#e5e7eb',
                    paddingBottom: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarLabel: 'Inicio',
                    tabBarIcon: ({ color, size, focused }: TabProps) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="finances"
                options={{
                    title: 'Finanzas',
                    tabBarLabel: 'Finanzas',
                    tabBarIcon: ({ color, size, focused }: TabProps) => (
                        <Ionicons
                            name={focused ? "wallet" : "wallet-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="tasks"
                options={{
                    title: 'Tareas',
                    tabBarLabel: 'Tareas',
                    tabBarIcon: ({ color, size, focused }: TabProps) => (
                        <Ionicons
                            name={focused ? "time" : "time-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="habits"
                options={{
                    title: 'Hábitos',
                    tabBarLabel: 'Hábitos',
                    tabBarIcon: ({ color, size, focused }: TabProps) => (
                        <Ionicons
                            name={focused ? "repeat" : "repeat-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="notes"
                options={{
                    title: 'Diario',
                    tabBarLabel: 'Diario',
                    tabBarIcon: ({ color, size, focused }: TabProps) => (
                        <Ionicons
                            name={focused ? "journal" : "journal-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Configuración',
                    tabBarLabel: 'Configuración',
                    tabBarIcon: ({ color, size, focused }: TabProps) => (
                        <Ionicons
                            name={focused ? "settings" : "settings-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    logoutButton: {
        marginRight: 16,
        padding: 8,
    },
});