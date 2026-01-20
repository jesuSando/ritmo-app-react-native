import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function FinancesLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
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
                    title: 'Resumen',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="pie-chart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="accounts"
                options={{
                    title: 'Cuentas',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="card" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: 'Transacciones',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="swap-horizontal" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="budgets"
                options={{
                    title: 'Presupuestos',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calculator" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}