import { AppHeader } from '@/components/app/AppHeader';
import { Card } from '@/components/card';
import { COLORS } from '@/constants/colors';
import { useFinanceAccounts } from '@/hooks/useFinanceAccounts';
import { formatCurrency } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const TABS = [
    { label: 'Resumen', href: '/finances', icon: 'pie-chart' },
    { label: 'Movs', href: '/finances/transactions', icon: 'swap-horizontal' },
    { label: 'Presup.', href: '/finances/budgets', icon: 'calculator' },
];

export default function FinancesLayout() {
    const router = useRouter();
    const pathname = usePathname();
    const { totalBalance, loading } = useFinanceAccounts();

    return (
        <ScrollView style={styles.container}>
            <AppHeader
                title="Finanzas"
                description="Control y seguimiento de tu dinero"
                subtitle='Todo en un solo lugar.'
            />

            <View style={styles.balanceSection}>
                <Card style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Balance Total</Text>
                    {loading ? (
                        <Text style={styles.balanceAmount}>Cargando...</Text>
                    ) : (
                        <Text style={styles.balanceAmount}>
                            {formatCurrency(totalBalance, 'CLP')}
                        </Text>
                    )}
                    <View style={styles.balanceStats}>
                        <View style={styles.statItem}>
                            <Ionicons name="arrow-up" size={16} color={COLORS.success} />
                            <Text style={styles.statText}>Ingresos</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="arrow-down" size={16} color={COLORS.error} />
                            <Text style={styles.statText}>Gastos</Text>
                        </View>
                    </View>
                </Card>
            </View>

            <View style={styles.tabs}>
                {TABS.map(tab => {
                    const active = pathname === tab.href;

                    return (
                        <Pressable
                            key={tab.href}
                            onPress={() => router.push(tab.href as any)}
                            style={styles.tab}
                        >
                            <View
                                style={[
                                    styles.tabContent,
                                    active && styles.activeTabContent
                                ]}
                            >
                                <Ionicons
                                    name={tab.icon as any}
                                    size={18}
                                    color={active ? COLORS.primary : COLORS.textSecondary}
                                />
                                <Text style={active ? styles.activeText : styles.text}>
                                    {tab.label}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            <View style={{ backgroundColor: COLORS.background }}>
                <Slot />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },
    balanceSection: {
        marginHorizontal: 16,
        marginTop: 8,
    },
    balanceCard: {
        padding: 24,
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: '#fff',
    },
    balanceLabel: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginVertical: 8,
    },
    balanceStats: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    tabs: {
        marginHorizontal: 16,
        marginVertical: 8,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 4,
    },
    tab: {
        flex: 1,
    },
    tabContent: {
        paddingVertical: 12,
        alignItems: 'center',
        gap: 6,
        borderRadius: 12,
    },
    activeTabContent: {
        backgroundColor: '#7870e620',
        borderRadius: 12,
    },
    text: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    activeText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
});