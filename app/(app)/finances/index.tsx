import { AppHeader } from '@/components/app/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/card';
import { COLORS } from '../../../constants/colors';
import { useFinanceAccounts } from '../../../hooks/useFinanceAccounts';
import { formatCurrency } from '../../../utils/formatters';

export default function FinancesOverviewScreen() {
    const { accounts, totalBalance, loading } = useFinanceAccounts();

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Cargando...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <AppHeader
                title={'Resumen Financiero'}
                subtitle='Todo en un solo lugar.'
                description='Gestiona tus finanzas con Ritmo.'
            />

            <Card style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Balance Total</Text>
                <Text style={styles.balanceAmount}>
                    {formatCurrency(totalBalance, 'CLP')}
                </Text>
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

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Cuentas</Text>
                    <Pressable
                    // onPress={() => router.push('/finances/accounts')}
                    >
                        <Text style={styles.seeAll}>Ver todas</Text>
                    </Pressable>
                </View>

                {accounts.slice(0, 3).map(account => (
                    <Card key={account.id} style={styles.accountCard}>
                        <View style={styles.accountInfo}>
                            <View style={[
                                styles.accountIcon,
                                { backgroundColor: getAccountColor(account.type) + '20' }
                            ]}>
                                <Ionicons
                                    name={getAccountIcon(account.type)}
                                    size={20}
                                    color={getAccountColor(account.type)}
                                />
                            </View>
                            <View style={styles.accountDetails}>
                                <Text style={styles.accountName}>{account.name}</Text>
                                <Text style={styles.accountType}>
                                    {account.type === 'bank_account' ? 'Cuenta Bancaria' :
                                        account.type === 'credit_card' ? 'Tarjeta de Crédito' :
                                            account.type === 'digital_wallet' ? 'Billetera Digital' :
                                                account.type === 'savings' ? 'Ahorros' : 'Efectivo'}
                                </Text>
                            </View>
                        </View>
                        <Text style={[
                            styles.accountBalance,
                            account.current_balance < 0 && { color: COLORS.error }
                        ]}>
                            {formatCurrency(account.current_balance, account.currency)}
                        </Text>
                    </Card>
                ))}

                {accounts.length === 0 && (
                    <Card style={styles.emptyCard}>
                        <Ionicons name="add-circle" size={48} color={COLORS.primary} />
                        <Text style={styles.emptyText}>Agrega tu primera cuenta</Text>
                        <Pressable
                            style={styles.addButton}
                        // onPress={() => router.push('/finances/accounts')}
                        >
                            <Text style={styles.addButtonText}>Crear Cuenta</Text>
                        </Pressable>
                    </Card>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                <View style={styles.quickActions}>
                    <Pressable
                        style={styles.actionButton}
                    // onPress={() => router.push('/finances/transactions?type=income')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#10b98120' }]}>
                            <Ionicons name="arrow-down" size={24} color="#10b981" />
                        </View>
                        <Text style={styles.actionText}>Ingreso</Text>
                    </Pressable>

                    <Pressable
                        style={styles.actionButton}
                    // onPress={() => router.push('/finances/transactions?type=expense')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#ef444420' }]}>
                            <Ionicons name="arrow-up" size={24} color="#ef4444" />
                        </View>
                        <Text style={styles.actionText}>Gasto</Text>
                    </Pressable>

                    <Pressable
                        style={styles.actionButton}
                    // onPress={() => router.push('/finances/budgets')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#8b5cf620' }]}>
                            <Ionicons name="calculator" size={24} color="#8b5cf6" />
                        </View>
                        <Text style={styles.actionText}>Presupuesto</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

function getAccountColor(type: string) {
    const colors: Record<string, string> = {
        cash: '#10b981',
        bank_account: '#3b82f6',
        credit_card: '#f59e0b',
        digital_wallet: '#8b5cf6',
        savings: '#06b6d4',
    };
    return colors[type] || '#6b7280';
}

function getAccountIcon(type: string): "cash" | "business" | "card" | "phone-portrait" | "trending-up" | "wallet" {
    const icons: Record<string, string> = {
        cash: 'cash',
        bank_account: 'business',
        credit_card: 'card',
        digital_wallet: 'phone-portrait',
        savings: 'trending-up',
    };
    return (icons[type] as "cash" | "business" | "card" | "phone-portrait" | "trending-up" | "wallet") || 'wallet';
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: COLORS.primary,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    balanceCard: {
        margin: 20,
        padding: 24,
        alignItems: 'center',
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
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    seeAll: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '500',
    },
    accountCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        padding: 16,
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    accountIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    accountDetails: {
        flex: 1,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    accountType: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    accountBalance: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    emptyCard: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginTop: 16,
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    actionButton: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'white',
        minWidth: 100,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
});