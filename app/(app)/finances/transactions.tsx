import { Card } from '@/components/card';
import { CreateTransactionModal } from '@/components/finances/CreateTransactionModal';
import { DayTransactionsList } from '@/components/finances/DayTransactionsList';
import { COLORS } from '@/constants/colors';
import { useFinanceAccounts } from '@/hooks/useFinanceAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency, parseLocalDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function TransactionsPage() {
    const {
        transactions,
        monthlySummary,
        loading,
        error,
        createTransaction,
        deleteTransaction,
        refresh,
    } = useTransactions();

    const { accounts } = useFinanceAccounts();

    // Estados para filtros
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [filterAccount, setFilterAccount] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Estado para modal
    const [showAddModal, setShowAddModal] = useState(false);

    // Filtrar transacciones
    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            // Filtrar por tipo
            if (filterType !== 'all' && transaction.type !== filterType) {
                return false;
            }

            // Filtrar por cuenta
            if (filterAccount && transaction.account_id !== filterAccount) {
                return false;
            }

            // Filtrar por búsqueda
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    transaction.description?.toLowerCase().includes(query) ||
                    transaction.category.toLowerCase().includes(query) ||
                    formatCurrency(transaction.amount, 'CLP').toLowerCase().includes(query)
                );
            }

            return true;
        });
    }, [transactions, filterType, filterAccount, searchQuery]);

    // Agrupar transacciones por fecha
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, typeof transactions> = {};

        filteredTransactions.forEach(transaction => {
            const date = parseLocalDate(transaction.date);
            const dateKey = format(date, 'yyyy-MM-dd');

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(transaction);
        });

        return Object.entries(groups)
            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
            .map(([date, transactions]) => ({
                date,
                formattedDate: format(parseLocalDate(date), "EEEE, d 'de' MMMM", { locale: es }),
                transactions: transactions.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ),
            }));
    }, [filteredTransactions]);

    // Manejar eliminación de transacción
    const handleDeleteTransaction = (id: number) => {
        Alert.alert(
            'Eliminar transacción',
            '¿Estás seguro de que quieres eliminar esta transacción?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteTransaction(id);
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Cargando transacciones...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
                <Pressable style={styles.retryButton} onPress={refresh}>
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={styles.container}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Transacciones</Text>
                        {accounts.length > 0 && (
                            <Pressable onPress={() => setShowAddModal(true)}>
                                <Text style={styles.seeAll}>Agregar</Text>
                            </Pressable>
                        )}
                    </View>
                    <Card>
                        <View style={styles.filterButtons}>
                            <Pressable
                                style={[
                                    styles.filterButton,
                                    filterType === 'all' && styles.filterButtonActive,
                                ]}
                                onPress={() => setFilterType('all')}
                            >
                                <Text
                                    style={[
                                        styles.filterButtonText,
                                        filterType === 'all' && styles.filterButtonTextActive,
                                    ]}
                                >
                                    Todas
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.filterButton,
                                    filterType === 'income' && styles.filterButtonActive,
                                ]}
                                onPress={() => setFilterType('income')}
                            >
                                <Ionicons
                                    name="arrow-down"
                                    size={16}
                                    color={filterType === 'income' ? COLORS.success : COLORS.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.filterButtonText,
                                        filterType === 'income' && styles.filterButtonTextActive,
                                    ]}
                                >
                                    Ingresos
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.filterButton,
                                    filterType === 'expense' && styles.filterButtonActive,
                                ]}
                                onPress={() => setFilterType('expense')}
                            >
                                <Ionicons
                                    name="arrow-up"
                                    size={16}
                                    color={filterType === 'expense' ? COLORS.error : COLORS.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.filterButtonText,
                                        filterType === 'expense' && styles.filterButtonTextActive,
                                    ]}
                                >
                                    Gastos
                                </Text>
                            </Pressable>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar transacciones..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery ? (
                                <Pressable onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                                </Pressable>
                            ) : null}
                        </View>

                        {accounts.length > 0 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.accountsFilter}
                            >
                                <Pressable
                                    style={[
                                        styles.accountFilterButton,
                                        !filterAccount && styles.accountFilterButtonActive,
                                    ]}
                                    onPress={() => setFilterAccount(null)}
                                >
                                    <Text
                                        style={[
                                            styles.accountFilterButtonText,
                                            !filterAccount && styles.accountFilterButtonTextActive,
                                        ]}
                                    >
                                        Todas
                                    </Text>
                                </Pressable>
                                {accounts.map(account => (
                                    <Pressable
                                        key={account.id}
                                        style={[
                                            styles.accountFilterButton,
                                            filterAccount === account.id && styles.accountFilterButtonActive,
                                        ]}
                                        onPress={() =>
                                            setFilterAccount(
                                                filterAccount === account.id ? null : account.id
                                            )
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.accountFilterButtonText,
                                                filterAccount === account.id &&
                                                styles.accountFilterButtonTextActive,
                                            ]}
                                        >
                                            {account.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                    </Card>

                    {/* Resumen de estadísticas */}
                    <View style={styles.statsRow}>
                        <Card style={styles.statCard}>
                            <Text style={styles.statLabel}>Total Ingresos</Text>
                            <Text style={[styles.statValue, styles.incomeValue]}>
                                +{formatCurrency(monthlySummary.income, 'CLP')}
                            </Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Text style={styles.statLabel}>Total Gastos</Text>
                            <Text style={[styles.statValue, styles.expenseValue]}>
                                -{formatCurrency(monthlySummary.expense, 'CLP')}
                            </Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Text style={styles.statLabel}>Balance Mensual</Text>
                            <Text
                                style={[
                                    styles.statValue,
                                    monthlySummary.balance >= 0 ? styles.incomeValue : styles.expenseValue,
                                ]}
                            >
                                {monthlySummary.balance >= 0 ? '+' : ''}
                                {formatCurrency(monthlySummary.balance, 'CLP')}
                            </Text>
                        </Card>
                    </View>
                </View>

                <View style={styles.section}>
                    <ScrollView style={styles.transactionsList}>
                        {groupedTransactions.length === 0 ? (
                            <Card style={styles.emptyCard}>
                                <Ionicons
                                    name="receipt-outline"
                                    size={64}
                                    color={COLORS.textSecondary}
                                />
                                <Text style={styles.emptyTitle}>
                                    {searchQuery || filterType !== 'all' || filterAccount
                                        ? 'No hay transacciones que coincidan'
                                        : 'No hay transacciones registradas'}
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    {searchQuery || filterType !== 'all' || filterAccount
                                        ? 'Intenta con otros filtros o busca algo diferente'
                                        : 'Agrega tu primera transacción para comenzar'}
                                </Text>
                            </Card>
                        ) : (
                            groupedTransactions.map(group => (
                                <DayTransactionsList
                                    transactions={group.transactions}
                                    accounts={accounts}
                                    onDelete={handleDeleteTransaction}
                                    formattedDate={group.formattedDate}
                                    date={group.date}
                                />
                            ))
                        )}
                    </ScrollView>
                </View>
            </ScrollView>

            <CreateTransactionModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onCreateTransaction={async (transaction) => {
                    await createTransaction(
                        transaction.amount,
                        transaction.type,
                        transaction.category,
                        transaction.date,
                        transaction.accountId,
                        transaction.description
                    );
                }}
                accounts={accounts}
            />
        </>
    );
}

// Los estilos permanecen iguales...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: COLORS.error,
        marginTop: 12,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
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
    filterButtons: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary + '20',
    },
    filterButtonText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    accountsFilter: {
        flexDirection: 'row',
    },
    accountFilterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    accountFilterButtonActive: {
        backgroundColor: COLORS.primary + '20',
    },
    accountFilterButtonText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    accountFilterButtonTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        marginVertical: 8,
        gap: 8,
    },
    statCard: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    incomeValue: {
        color: COLORS.success,
    },
    expenseValue: {
        color: COLORS.error,
    },
    transactionsList: {
        flex: 1,
    },
    emptyCard: {
        padding: 40,
        alignItems: 'center',
        marginTop: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginTop: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    dateGroup: {
        marginBottom: 24,
    },
    dateHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
        textTransform: 'capitalize',
    },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        padding: 12,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionCategory: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    transactionDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    transactionAccount: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    incomeAmount: {
        color: COLORS.success,
    },
    expenseAmount: {
        color: COLORS.error,
    },
    deleteButton: {
        padding: 4,
    },
});