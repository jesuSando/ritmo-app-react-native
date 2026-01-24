import { Card } from '@/components/card';
import { COLORS } from '@/constants/colors';
import { useFinanceAccounts } from '@/hooks/useFinanceAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

// Categorías predefinidas
const INCOME_CATEGORIES = [
    'Salario',
    'Freelance',
    'Inversiones',
    'Regalos',
    'Reembolsos',
    'Otros ingresos',
];

const EXPENSE_CATEGORIES = [
    'Alimentos',
    'Transporte',
    'Vivienda',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Compras',
    'Servicios',
    'Viajes',
    'Otros gastos',
];

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

    // Estados para modal de nueva transacción
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: '',
        category: '',
        description: '',
        accountId: accounts[0]?.id || 0,
        date: format(new Date(), 'yyyy-MM-dd'),
    });

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
            const date = new Date(transaction.date);
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
                formattedDate: format(new Date(date), "EEEE, d 'de' MMMM", { locale: es }),
                transactions: transactions.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ),
            }));
    }, [filteredTransactions]);

    // Manejar creación de transacción
    const handleCreateTransaction = async () => {
        if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
            Alert.alert('Error', 'Por favor ingresa un monto válido');
            return;
        }

        if (!newTransaction.category) {
            Alert.alert('Error', 'Por favor selecciona una categoría');
            return;
        }

        if (!newTransaction.accountId) {
            Alert.alert('Error', 'Por favor selecciona una cuenta');
            return;
        }

        try {
            await createTransaction(
                parseFloat(newTransaction.amount),
                newTransaction.type,
                newTransaction.category,
                newTransaction.date,
                newTransaction.accountId,
                newTransaction.description
            );

            setNewTransaction({
                type: 'expense',
                amount: '',
                category: '',
                description: '',
                accountId: accounts[0]?.id || 0,
                date: format(new Date(), 'yyyy-MM-dd'),
            });
            setShowAddModal(false);
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la transacción');
        }
    };

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
        <View style={styles.container}>
            {/* Filtros y búsqueda */}
            <Card style={styles.filtersCard}>
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

            {/* Lista de transacciones */}
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
                        <View key={group.date} style={styles.dateGroup}>
                            <Text style={styles.dateHeader}>{group.formattedDate}</Text>
                            {group.transactions.map(transaction => (
                                <Card key={transaction.id} style={styles.transactionCard}>
                                    <View style={styles.transactionLeft}>
                                        <View
                                            style={[
                                                styles.transactionIcon,
                                                {
                                                    backgroundColor:
                                                        transaction.type === 'income'
                                                            ? '#10b98120'
                                                            : '#ef444420',
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name={
                                                    transaction.type === 'income'
                                                        ? 'arrow-down'
                                                        : 'arrow-up'
                                                }
                                                size={20}
                                                color={
                                                    transaction.type === 'income'
                                                        ? COLORS.success
                                                        : COLORS.error
                                                }
                                            />
                                        </View>
                                        <View style={styles.transactionDetails}>
                                            <Text style={styles.transactionCategory}>
                                                {transaction.category}
                                            </Text>
                                            {transaction.description ? (
                                                <Text style={styles.transactionDescription}>
                                                    {transaction.description}
                                                </Text>
                                            ) : null}
                                            <Text style={styles.transactionAccount}>
                                                {accounts.find(a => a.id === transaction.account_id)
                                                    ?.name || 'Cuenta'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.transactionRight}>
                                        <Text
                                            style={[
                                                styles.transactionAmount,
                                                transaction.type === 'income'
                                                    ? styles.incomeAmount
                                                    : styles.expenseAmount,
                                            ]}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}
                                            {formatCurrency(transaction.amount, 'CLP')}
                                        </Text>
                                        <Pressable
                                            style={styles.deleteButton}
                                            onPress={() => handleDeleteTransaction(transaction.id)}
                                        >
                                            <Ionicons
                                                name="trash-outline"
                                                size={18}
                                                color={COLORS.textSecondary}
                                            />
                                        </Pressable>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Botón flotante para agregar transacción */}
            <Pressable
                style={styles.fab}
                onPress={() => setShowAddModal(true)}
            >
                <Ionicons name="add" size={24} color="white" />
            </Pressable>

            {/* Modal para nueva transacción */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nueva Transacción</Text>
                            <Pressable
                                onPress={() => setShowAddModal(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            {/* Tipo de transacción */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tipo</Text>
                                <View style={styles.typeButtons}>
                                    <Pressable
                                        style={[
                                            styles.typeButton,
                                            newTransaction.type === 'expense' &&
                                                styles.typeButtonActive,
                                            newTransaction.type === 'expense' && {
                                                backgroundColor: '#ef444420',
                                                borderColor: COLORS.error,
                                            },
                                        ]}
                                        onPress={() =>
                                            setNewTransaction({ ...newTransaction, type: 'expense' })
                                        }
                                    >
                                        <Ionicons
                                            name="arrow-up"
                                            size={20}
                                            color={
                                                newTransaction.type === 'expense'
                                                    ? COLORS.error
                                                    : COLORS.textSecondary
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.typeButtonText,
                                                newTransaction.type === 'expense' &&
                                                    styles.typeButtonTextActive,
                                                newTransaction.type === 'expense' && {
                                                    color: COLORS.error,
                                                },
                                            ]}
                                        >
                                            Gasto
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[
                                            styles.typeButton,
                                            newTransaction.type === 'income' &&
                                                styles.typeButtonActive,
                                            newTransaction.type === 'income' && {
                                                backgroundColor: '#10b98120',
                                                borderColor: COLORS.success,
                                            },
                                        ]}
                                        onPress={() =>
                                            setNewTransaction({ ...newTransaction, type: 'income' })
                                        }
                                    >
                                        <Ionicons
                                            name="arrow-down"
                                            size={20}
                                            color={
                                                newTransaction.type === 'income'
                                                    ? COLORS.success
                                                    : COLORS.textSecondary
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.typeButtonText,
                                                newTransaction.type === 'income' &&
                                                    styles.typeButtonTextActive,
                                                newTransaction.type === 'income' && {
                                                    color: COLORS.success,
                                                },
                                            ]}
                                        >
                                            Ingreso
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Monto */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Monto</Text>
                                <View style={styles.amountInputContainer}>
                                    <Text style={styles.currencySymbol}>$</Text>
                                    <TextInput
                                        style={styles.amountInput}
                                        placeholder="0"
                                        value={newTransaction.amount}
                                        onChangeText={value =>
                                            setNewTransaction({ ...newTransaction, amount: value })
                                        }
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.currencyLabel}>CLP</Text>
                                </View>
                            </View>

                            {/* Categoría */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Categoría</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.categoryScroll}
                                >
                                    {(newTransaction.type === 'income'
                                        ? INCOME_CATEGORIES
                                        : EXPENSE_CATEGORIES
                                    ).map(category => (
                                        <Pressable
                                            key={category}
                                            style={[
                                                styles.categoryButton,
                                                newTransaction.category === category &&
                                                    styles.categoryButtonActive,
                                            ]}
                                            onPress={() =>
                                                setNewTransaction({
                                                    ...newTransaction,
                                                    category,
                                                })
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.categoryButtonText,
                                                    newTransaction.category === category &&
                                                        styles.categoryButtonTextActive,
                                                ]}
                                            >
                                                {category}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Cuenta */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Cuenta</Text>
                                {accounts.length === 0 ? (
                                    <Text style={styles.errorText}>
                                        Primero debes crear una cuenta
                                    </Text>
                                ) : (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.accountsScroll}
                                    >
                                        {accounts.map(account => (
                                            <Pressable
                                                key={account.id}
                                                style={[
                                                    styles.accountButton,
                                                    newTransaction.accountId === account.id &&
                                                        styles.accountButtonActive,
                                                ]}
                                                onPress={() =>
                                                    setNewTransaction({
                                                        ...newTransaction,
                                                        accountId: account.id,
                                                    })
                                                }
                                            >
                                                <Ionicons
                                                    name={
                                                        account.type === 'cash'
                                                            ? 'cash'
                                                            : account.type === 'bank_account'
                                                            ? 'business'
                                                            : account.type === 'credit_card'
                                                            ? 'card'
                                                            : account.type === 'digital_wallet'
                                                            ? 'phone-portrait'
                                                            : 'trending-up'
                                                    }
                                                    size={20}
                                                    color={
                                                        newTransaction.accountId === account.id
                                                            ? COLORS.primary
                                                            : COLORS.textSecondary
                                                    }
                                                />
                                                <Text
                                                    style={[
                                                        styles.accountButtonText,
                                                        newTransaction.accountId === account.id &&
                                                            styles.accountButtonTextActive,
                                                    ]}
                                                >
                                                    {account.name}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>

                            {/* Descripción */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Descripción (opcional)</Text>
                                <TextInput
                                    style={styles.descriptionInput}
                                    placeholder="Agrega una descripción..."
                                    value={newTransaction.description}
                                    onChangeText={value =>
                                        setNewTransaction({
                                            ...newTransaction,
                                            description: value,
                                        })
                                    }
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            {/* Fecha */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Fecha</Text>
                                <View style={styles.dateInputContainer}>
                                    <Ionicons
                                        name="calendar"
                                        size={20}
                                        color={COLORS.textSecondary}
                                    />
                                    <Text style={styles.dateText}>
                                        {format(
                                            new Date(newTransaction.date),
                                            "dd 'de' MMMM, yyyy",
                                            { locale: es }
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Botones de acción */}
                        <View style={styles.modalActions}>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowAddModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.modalButton,
                                    styles.saveButton,
                                    (!newTransaction.amount ||
                                        !newTransaction.category ||
                                        !newTransaction.accountId) &&
                                        styles.saveButtonDisabled,
                                ]}
                                onPress={handleCreateTransaction}
                                disabled={
                                    !newTransaction.amount ||
                                    !newTransaction.category ||
                                    !newTransaction.accountId
                                }
                            >
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

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
    filtersCard: {
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
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
        marginHorizontal: 16,
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
        paddingHorizontal: 16,
        paddingTop: 8,
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
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    closeButton: {
        padding: 4,
    },
    modalForm: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    typeButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    typeButtonActive: {
        borderWidth: 2,
    },
    typeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    typeButtonTextActive: {
        color: COLORS.textPrimary,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    currencySymbol: {
        fontSize: 18,
        color: COLORS.textSecondary,
        marginRight: 4,
    },
    amountInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    currencyLabel: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    categoryScroll: {
        flexDirection: 'row',
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    categoryButtonActive: {
        backgroundColor: COLORS.primary + '20',
    },
    categoryButtonText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    categoryButtonTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    accountsScroll: {
        flexDirection: 'row',
    },
    accountButton: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        marginRight: 12,
        minWidth: 80,
    },
    accountButtonActive: {
        backgroundColor: COLORS.primary + '20',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    accountButtonText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    accountButtonTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    descriptionInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.textPrimary,
        textAlignVertical: 'top',
        minHeight: 80,
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dateText: {
        fontSize: 16,
        color: COLORS.textPrimary,
        marginLeft: 12,
    },
    modalActions: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});