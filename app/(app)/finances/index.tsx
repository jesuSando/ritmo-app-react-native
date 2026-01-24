import { CreateAccountModal } from '@/components/finances/CreateAccountModal';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/card';
import { COLORS } from '../../../constants/colors';
import { useFinanceAccounts } from '../../../hooks/useFinanceAccounts';
import { formatCurrency } from '../../../utils/formatters';

export default function FinancesOverviewScreen() {
    const { accounts, loading, createAccount } = useFinanceAccounts();
    const [isModalVisible, setIsModalVisible] = useState(false);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Cargando...</Text>
            </View>
        );
    }

    const handleCreateAccount = async (
        name: string,
        type: string,
        currency: string,
        initialBalance: number
    ) => {
        await createAccount(name, type as any, currency as any, initialBalance);
    };

    return (
        <>
            <ScrollView style={styles.container}>
                {/* Sección de Cuentas */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Cuentas</Text>
                        {accounts.length > 0 && (
                            <Pressable onPress={() => { /* Navegar a todas las cuentas */ }}>
                                <Text style={styles.seeAll}>Ver todas</Text>
                            </Pressable>
                        )}
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

                    {/* Botón para agregar cuenta */}
                    <Card style={styles.addAccountCard}>
                        <Pressable 
                            style={styles.addAccountButton}
                            onPress={() => setIsModalVisible(true)}
                        >
                            <View style={styles.addAccountIcon}>
                                <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
                            </View>
                            <View style={styles.addAccountTexts}>
                                <Text style={styles.addAccountTitle}>Agregar nueva cuenta</Text>
                                <Text style={styles.addAccountSubtitle}>
                                    Mantén todas tus finanzas organizadas en un solo lugar
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                        </Pressable>
                    </Card>

                    {/* Estado vacío */}
                    {accounts.length === 0 && (
                        <Card style={styles.emptyCard}>
                            <Ionicons name="add-circle" size={64} color={COLORS.primary} />
                            <Text style={styles.emptyTitle}>¡Comienza tu viaje financiero!</Text>
                            <Text style={styles.emptySubtitle}>
                                Agrega tu primera cuenta para comenzar a rastrear tus finanzas
                            </Text>
                            <Pressable
                                style={styles.addButton}
                                onPress={() => setIsModalVisible(true)}
                            >
                                <Ionicons name="add" size={20} color="white" />
                                <Text style={styles.addButtonText}>Crear Primera Cuenta</Text>
                            </Pressable>
                        </Card>
                    )}
                </View>

                {/* Acciones Rápidas */}
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

            {/* Modal para crear cuenta */}
            <CreateAccountModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onCreateAccount={handleCreateAccount}
            />
        </>
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
    addAccountCard: {
        marginTop: 12,
        padding: 0,
        overflow: 'hidden',
    },
    addAccountButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    addAccountIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addAccountTexts: {
        flex: 1,
    },
    addAccountTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    addAccountSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    emptyCard: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
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