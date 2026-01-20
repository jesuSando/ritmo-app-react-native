import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/card';
import { COLORS } from '../../constants/colors';
import { useFinanceAccounts } from '../../hooks/useFinanceAccounts';
import { formatCurrency } from '../../utils/formatters';

export default function FinancesScreen() {
    const { accounts, totalBalance, loading, refresh } = useFinanceAccounts();
    const [showAddModal, setShowAddModal] = useState(false);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Cargando...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Finanzas</Text>
                <Pressable onPress={refresh} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={24} color={COLORS.primary} />
                </Pressable>
            </View>

            <Card style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <View>
                        <Text style={styles.summaryLabel}>Balance Total</Text>
                        <Text style={styles.summaryAmount}>
                            {formatCurrency(totalBalance, 'CLP')}
                        </Text>
                    </View>
                    <Pressable
                        onPress={() => setShowAddModal(true)}
                        style={styles.addButton}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </Pressable>
                </View>
            </Card>

            <View style={styles.accountsSection}>
                <Text style={styles.sectionTitle}>Mis Cuentas</Text>
                {accounts.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Ionicons name="wallet-outline" size={48} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>
                            No tienes cuentas registradas
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Crea tu primera cuenta para empezar
                        </Text>
                    </Card>
                ) : (
                    accounts.map(account => (
                        <Card key={account.id} style={styles.accountCard}>
                            <View style={styles.accountInfo}>
                                <View style={styles.accountIcon}>
                                    <Ionicons
                                        name={getAccountIcon(account.type)}
                                        size={24}
                                        color={COLORS.primary}
                                    />
                                </View>
                                <View style={styles.accountDetails}>
                                    <Text style={styles.accountName}>{account.name}</Text>
                                    <Text style={styles.accountType}>{account.type}</Text>
                                </View>
                            </View>
                            <Text style={styles.accountBalance}>
                                {formatCurrency(account.current_balance, account.currency)}
                            </Text>
                        </Card>
                    ))
                )}
            </View>
        </ScrollView>
    );
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    refreshButton: {
        padding: 8,
    },
    summaryCard: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    summaryAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 4,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    accountsSection: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    emptyCard: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: 'center',
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
        backgroundColor: '#f3f4f6',
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
        textTransform: 'capitalize',
    },
    accountBalance: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
});