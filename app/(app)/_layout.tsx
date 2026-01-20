import { AppDrawerContent } from '@/components/app/AppDrawerContent';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StyleSheet } from 'react-native';
import { useAuth } from '../../auth/useAuth';

type DrawerProps = {
    color: string;
    size: number;
}

export default function AppLayout() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <Drawer
            drawerContent={(props) => <AppDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: '#7870e6',
                drawerInactiveTintColor: '#6b7280',
                drawerActiveBackgroundColor: '#7870e620',
                drawerStyle: {
                    backgroundColor: '#fff',
                    width: 280,
                },
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    drawerLabel: 'Inicio',
                    drawerIcon: ({ color, size }: DrawerProps) => (
                        <Ionicons name="home" size={size} color={color} />
                    )
                }}
            />

            <Drawer.Screen
                name="finances"
                options={{
                    title: 'Finanzas',
                    drawerLabel: 'Finanzas',
                    drawerIcon: ({ color, size }: DrawerProps) => (
                        <Ionicons name="wallet" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="tasks"
                options={{
                    title: 'Gestión del Tiempo',
                    drawerLabel: 'Tareas & Tiempo',
                    drawerIcon: ({ color, size }: DrawerProps) => (
                        <Ionicons name="time" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="habits"
                options={{
                    title: 'Hábitos',
                    drawerLabel: 'Hábitos',
                    drawerIcon: ({ color, size }: DrawerProps) => (
                        <Ionicons name="repeat" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="notes"
                options={{
                    title: 'Notas de Vida',
                    drawerLabel: 'Diario Personal',
                    drawerIcon: ({ color, size }: DrawerProps) => (
                        <Ionicons name="journal" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="settings"
                options={{
                    title: 'Configuración',
                    drawerLabel: 'Configuración',
                    drawerIcon: ({ color, size }: DrawerProps) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Drawer>
    );
}

const styles = StyleSheet.create({
    logoutButton: {
        marginRight: 16,
        padding: 8,
    },
});