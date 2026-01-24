import { Card } from '@/components/card';
import { COLORS } from '@/constants/colors';
import { useBudgets } from '@/hooks/useBudgets';
import { useFinanceAccounts } from '@/hooks/useFinanceAccounts';
import { formatCurrency } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { addDays, addMonths, addWeeks, addYears, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// Períodos de presupuesto
const BUDGET_PERIODS = [
    { value: 'daily', label: 'Diario', icon: 'today', days: 1 },
    { value: 'weekly', label: 'Semanal', icon: 'calendar', days: 7 },
    { value: 'monthly', label: 'Mensual', icon: 'calendar-outline', days: 30 },
    { value: 'yearly', label: 'Anual', icon: 'calendar-sharp', days: 365 },
    { value: 'custom', label: 'Personalizado', icon: 'options', days: 0 },
];

// Categorías comunes
const BUDGET_CATEGORIES = [
    'Alimentos',
    'Transporte',
    'Vivienda',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Compras',
    'Servicios',
    'Viajes',
    'Ahorros',
    'Inversiones',
    'Otros',
];

export default function BudgetsPage() {
    const {
        budgets,
        loading,
        error,
        createBudget,
        updateBudget,
        deleteBudget,
        toggleBudgetStatus,
        getBudgetProgress,
        getBudgetStatus,
        refresh,
    } = useBudgets();

    const { accounts } = useFinanceAccounts();

    // Estados para filtros
    const [filterPeriod, setFilterPeriod] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');

    // Estados para modal de nuevo presupuesto
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBudget, setNewBudget] = useState({
        name: '',
        amount: '',
        period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        category: '',
        accountId: undefined as number | undefined,
    });

    // Estados para edición
    const [editingBudget, setEditingBudget] = useState<typeof budgets[0] | null>(null);

    // Filtrar presupuestos
    const filteredBudgets = useMemo(() => {
        return budgets.filter(budget => {
            // Filtrar por período
            if (filterPeriod !== 'all' && budget.period !== filterPeriod) {
                return false;
            }

            // Filtrar por estado
            if (filterStatus === 'active' && !budget.is_active) {
                return false;
            }
            if (filterStatus === 'inactive' && budget.is_active) {
                return false;
            }

            return true;
        });
    }, [budgets, filterPeriod, filterStatus]);

    // Calcular estadísticas
    const stats = useMemo(() => {
        const activeBudgets = budgets.filter(b => b.is_active);
        const totalBudget = activeBudgets.reduce((sum, b) => sum + b.amount, 0);
        const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent_amount, 0);
        const totalRemaining = totalBudget - totalSpent;

        return {
            totalBudget,
            totalSpent,
            totalRemaining,
            percentageUsed: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        };
    }, [budgets]);

    // Calcular fecha de finalización basada en el período
    const calculateEndDate = (period: string, startDate: string) => {
        const start = parseISO(startDate);
        switch (period) {
            case 'daily':
                return format(addDays(start, 1), 'yyyy-MM-dd');
            case 'weekly':
                return format(addWeeks(start, 1), 'yyyy-MM-dd');
            case 'monthly':
                return format(addMonths(start, 1), 'yyyy-MM-dd');
            case 'yearly':
                return format(addYears(start, 1), 'yyyy-MM-dd');
            default:
                return '';
        }
    };

    // Manejar creación de presupuesto
    const handleCreateBudget = async () => {
        if (!newBudget.name.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre para el presupuesto');
            return;
        }

        if (!newBudget.amount || parseFloat(newBudget.amount) <= 0) {
            Alert.alert('Error', 'Por favor ingresa un monto válido');
            return;
        }

        try {
            const endDate = newBudget.period === 'custom' && newBudget.endDate
                ? newBudget.endDate
                : calculateEndDate(newBudget.period, newBudget.startDate);

            await createBudget(
                newBudget.name.trim(),
                parseFloat(newBudget.amount),
                newBudget.period,
                newBudget.startDate,
                endDate || undefined,
                newBudget.category || undefined,
                newBudget.accountId
            );

            resetNewBudgetForm();
            setShowAddModal(false);
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear el presupuesto');
        }
    };

    // Manejar actualización de presupuesto
    const handleUpdateBudget = async () => {
        if (!editingBudget) return;

        try {
            await updateBudget(editingBudget.id, {
                name: editingBudget.name,
                amount: editingBudget.amount,
                period: editingBudget.period,
                start_date: editingBudget.start_date,
                end_date: editingBudget.end_date,
                category: editingBudget.category,
                is_active: editingBudget.is_active,
            });
            setEditingBudget(null);
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el presupuesto');
        }
    };

    // Manejar eliminación de presupuesto
    const handleDeleteBudget = (id: number, name: string) => {
        Alert.alert(
            'Eliminar presupuesto',
            `¿Estás seguro de que quieres eliminar el presupuesto "${name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteBudget(id);
                    },
                },
            ]
        );
    };

    // Reiniciar formulario de nuevo presupuesto
    const resetNewBudgetForm = () => {
        setNewBudget({
            name: '',
            amount: '',
            period: 'monthly',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: '',
            category: '',
            accountId: undefined,
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Cargando presupuestos...</Text>
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
            {/* Estadísticas generales */}
            <Card style={styles.statsCard}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Presupuesto Total</Text>
                        <Text style={styles.statValue}>
                            {formatCurrency(stats.totalBudget, 'CLP')}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Gastado</Text>
                        <Text style={[styles.statValue, styles.spentValue]}>
                            {formatCurrency(stats.totalSpent, 'CLP')}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Disponible</Text>
                        <Text style={[styles.statValue, styles.remainingValue]}>
                            {formatCurrency(stats.totalRemaining, 'CLP')}
                        </Text>
                    </View>
                </View>

                {/* Barra de progreso general */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${Math.min(stats.percentageUsed, 100)}%`,
                                    backgroundColor:
                                        stats.percentageUsed >= 100
                                            ? COLORS.error
                                            : stats.percentageUsed >= 80
                                                ? COLORS.warning
                                                : COLORS.success,
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {stats.percentageUsed.toFixed(1)}% utilizado
                    </Text>
                </View>
            </Card>

            {/* Filtros */}
            <Card style={styles.filtersCard}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.periodFilters}
                >
                    <Pressable
                        style={[
                            styles.filterButton,
                            filterPeriod === 'all' && styles.filterButtonActive,
                        ]}
                        onPress={() => setFilterPeriod('all')}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                filterPeriod === 'all' && styles.filterButtonTextActive,
                            ]}
                        >
                            Todos
                        </Text>
                    </Pressable>
                    {BUDGET_PERIODS.map(period => (
                        <Pressable
                            key={period.value}
                            style={[
                                styles.filterButton,
                                filterPeriod === period.value && styles.filterButtonActive,
                            ]}
                            onPress={() => setFilterPeriod(period.value)}
                        >
                            <Ionicons
                                name={period.icon as any}
                                size={16}
                                color={
                                    filterPeriod === period.value
                                        ? COLORS.primary
                                        : COLORS.textSecondary
                                }
                            />
                            <Text
                                style={[
                                    styles.filterButtonText,
                                    filterPeriod === period.value && styles.filterButtonTextActive,
                                ]}
                            >
                                {period.label}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                <View style={styles.statusFilters}>
                    <Pressable
                        style={[
                            styles.statusButton,
                            filterStatus === 'all' && styles.statusButtonActive,
                        ]}
                        onPress={() => setFilterStatus('all')}
                    >
                        <Text
                            style={[
                                styles.statusButtonText,
                                filterStatus === 'all' && styles.statusButtonTextActive,
                            ]}
                        >
                            Todos
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.statusButton,
                            filterStatus === 'active' && styles.statusButtonActive,
                        ]}
                        onPress={() => setFilterStatus('active')}
                    >
                        <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={
                                filterStatus === 'active' ? COLORS.success : COLORS.textSecondary
                            }
                        />
                        <Text
                            style={[
                                styles.statusButtonText,
                                filterStatus === 'active' && styles.statusButtonTextActive,
                            ]}
                        >
                            Activos
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.statusButton,
                            filterStatus === 'inactive' && styles.statusButtonActive,
                        ]}
                        onPress={() => setFilterStatus('inactive')}
                    >
                        <Ionicons
                            name="close-circle"
                            size={16}
                            color={
                                filterStatus === 'inactive' ? COLORS.error : COLORS.textSecondary
                            }
                        />
                        <Text
                            style={[
                                styles.statusButtonText,
                                filterStatus === 'inactive' && styles.statusButtonTextActive,
                            ]}
                        >
                            Inactivos
                        </Text>
                    </Pressable>
                </View>
            </Card>

            {/* Lista de presupuestos */}
            <ScrollView style={styles.budgetsList}>
                {filteredBudgets.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Ionicons name="wallet-outline" size={64} color={COLORS.textSecondary} />
                        <Text style={styles.emptyTitle}>
                            {filterPeriod !== 'all' || filterStatus !== 'active'
                                ? 'No hay presupuestos que coincidan'
                                : 'No hay presupuestos registrados'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {filterPeriod !== 'all' || filterStatus !== 'active'
                                ? 'Intenta con otros filtros'
                                : 'Crea tu primer presupuesto para controlar tus gastos'}
                        </Text>
                        <Pressable
                            style={styles.createButton}
                            onPress={() => setShowAddModal(true)}
                        >
                            <Ionicons name="add" size={20} color="white" />
                            <Text style={styles.createButtonText}>Crear Primer Presupuesto</Text>
                        </Pressable>
                    </Card>
                ) : (
                    filteredBudgets.map(budget => {
                        const progress = getBudgetProgress(budget);
                        const status = getBudgetStatus(budget);
                        const remaining = budget.amount - budget.spent_amount;

                        return (
                            <Card key={budget.id} style={styles.budgetCard}>
                                <View style={styles.budgetHeader}>
                                    <View style={styles.budgetTitleContainer}>
                                        <Text style={styles.budgetName}>{budget.name}</Text>
                                        {budget.category && (
                                            <View style={styles.categoryBadge}>
                                                <Text style={styles.categoryText}>
                                                    {budget.category}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={styles.periodBadge}>
                                            <Ionicons
                                                name={
                                                    BUDGET_PERIODS.find(p => p.value === budget.period)
                                                        ?.icon as any
                                                }
                                                size={12}
                                                color={COLORS.primary}
                                            />
                                            <Text style={styles.periodText}>
                                                {BUDGET_PERIODS.find(p => p.value === budget.period)
                                                    ?.label || budget.period}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.budgetActions}>
                                        <Pressable
                                            style={styles.actionButton}
                                            onPress={() => setEditingBudget(budget)}
                                        >
                                            <Ionicons
                                                name="create-outline"
                                                size={18}
                                                color={COLORS.textSecondary}
                                            />
                                        </Pressable>
                                        <Pressable
                                            style={styles.actionButton}
                                            onPress={() => toggleBudgetStatus(budget.id, budget.is_active)}
                                        >
                                            <Ionicons
                                                name={budget.is_active ? 'pause-circle' : 'play-circle'}
                                                size={18}
                                                color={budget.is_active ? COLORS.success : COLORS.error}
                                            />
                                        </Pressable>
                                        <Pressable
                                            style={styles.actionButton}
                                            onPress={() => handleDeleteBudget(budget.id, budget.name)}
                                        >
                                            <Ionicons
                                                name="trash-outline"
                                                size={18}
                                                color={COLORS.error}
                                            />
                                        </Pressable>
                                    </View>
                                </View>

                                <View style={styles.budgetProgress}>
                                    <View style={styles.progressLabels}>
                                        <Text style={styles.progressLabel}>
                                            Gastado: {formatCurrency(budget.spent_amount, 'CLP')}
                                        </Text>
                                        <Text style={styles.progressLabel}>
                                            Total: {formatCurrency(budget.amount, 'CLP')}
                                        </Text>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                {
                                                    width: `${progress}%`,
                                                    backgroundColor:
                                                        status === 'exceeded'
                                                            ? COLORS.error
                                                            : status === 'warning'
                                                                ? COLORS.warning
                                                                : COLORS.success,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.progressInfo}>
                                        <Text
                                            style={[
                                                styles.progressPercentage,
                                                status === 'exceeded' && styles.exceededText,
                                                status === 'warning' && styles.warningText,
                                            ]}
                                        >
                                            {progress.toFixed(1)}%
                                        </Text>
                                        <Text
                                            style={[
                                                styles.remainingText,
                                                remaining < 0 && styles.exceededText,
                                            ]}
                                        >
                                            {remaining >= 0 ? 'Restante: ' : 'Excedido: '}
                                            {formatCurrency(Math.abs(remaining), 'CLP')}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.budgetDates}>
                                    <View style={styles.dateItem}>
                                        <Ionicons name="calendar" size={14} color={COLORS.textSecondary} />
                                        <Text style={styles.dateText}>
                                            Inicio: {format(parseISO(budget.start_date), 'dd/MM/yy')}
                                        </Text>
                                    </View>
                                    {budget.end_date && (
                                        <View style={styles.dateItem}>
                                            <Ionicons name="calendar" size={14} color={COLORS.textSecondary} />
                                            <Text style={styles.dateText}>
                                                Fin: {format(parseISO(budget.end_date), 'dd/MM/yy')}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {budget.account_id && (
                                    <View style={styles.budgetAccount}>
                                        <Ionicons
                                            name={
                                                accounts.find(a => a.id === budget.account_id)?.type === 'cash'
                                                    ? 'cash'
                                                    : accounts.find(a => a.id === budget.account_id)?.type ===
                                                        'bank_account'
                                                        ? 'business'
                                                        : accounts.find(a => a.id === budget.account_id)?.type ===
                                                            'credit_card'
                                                            ? 'card'
                                                            : accounts.find(a => a.id === budget.account_id)?.type ===
                                                                'digital_wallet'
                                                                ? 'phone-portrait'
                                                                : 'trending-up'
                                            }
                                            size={14}
                                            color={COLORS.textSecondary}
                                        />
                                        <Text style={styles.accountText}>
                                            {accounts.find(a => a.id === budget.account_id)?.name || 'Cuenta'}
                                        </Text>
                                    </View>
                                )}
                            </Card>
                        );
                    })
                )}
            </ScrollView>

            {/* Botón flotante para agregar presupuesto */}
            <Pressable style={styles.fab} onPress={() => setShowAddModal(true)}>
                <Ionicons name="add" size={24} color="white" />
            </Pressable>

            {/* Modal para nuevo presupuesto */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nuevo Presupuesto</Text>
                            <Pressable
                                onPress={() => setShowAddModal(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            {/* Nombre */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nombre del presupuesto</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: Presupuesto mensual de comida"
                                    value={newBudget.name}
                                    onChangeText={value =>
                                        setNewBudget({ ...newBudget, name: value })
                                    }
                                />
                            </View>

                            {/* Monto */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Monto total</Text>
                                <View style={styles.amountInputContainer}>
                                    <Text style={styles.currencySymbol}>$</Text>
                                    <TextInput
                                        style={styles.amountInput}
                                        placeholder="0"
                                        value={newBudget.amount}
                                        onChangeText={value =>
                                            setNewBudget({ ...newBudget, amount: value })
                                        }
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.currencyLabel}>CLP</Text>
                                </View>
                            </View>

                            {/* Período */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Período</Text>
                                <View style={styles.periodButtons}>
                                    {BUDGET_PERIODS.map(period => (
                                        <Pressable
                                            key={period.value}
                                            style={[
                                                styles.periodButton,
                                                newBudget.period === period.value && styles.periodButtonActive,
                                            ]}
                                            onPress={() =>
                                                setNewBudget({ ...newBudget, period: period.value as any })
                                            }
                                        >
                                            <Ionicons
                                                name={period.icon as any}
                                                size={20}
                                                color={
                                                    newBudget.period === period.value
                                                        ? COLORS.primary
                                                        : COLORS.textSecondary
                                                }
                                            />
                                            <Text
                                                style={[
                                                    styles.periodButtonText,
                                                    newBudget.period === period.value &&
                                                    styles.periodButtonTextActive,
                                                ]}
                                            >
                                                {period.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* Fecha de inicio */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Fecha de inicio</Text>
                                <View style={styles.dateInputContainer}>
                                    <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
                                    <Text style={styles.dateText}>
                                        {format(parseISO(newBudget.startDate), "dd 'de' MMMM, yyyy", {
                                            locale: es,
                                        })}
                                    </Text>
                                </View>
                            </View>

                            {/* Fecha de fin (solo para custom) */}
                            {newBudget.period === 'custom' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Fecha de fin (opcional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        value={newBudget.endDate}
                                        onChangeText={value =>
                                            setNewBudget({ ...newBudget, endDate: value })
                                        }
                                    />
                                </View>
                            )}

                            {/* Categoría */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Categoría (opcional)</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.categoryScroll}
                                >
                                    {BUDGET_CATEGORIES.map(category => (
                                        <Pressable
                                            key={category}
                                            style={[
                                                styles.categoryButton,
                                                newBudget.category === category && styles.categoryButtonActive,
                                            ]}
                                            onPress={() =>
                                                setNewBudget({
                                                    ...newBudget,
                                                    category: newBudget.category === category ? '' : category,
                                                })
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.categoryButtonText,
                                                    newBudget.category === category &&
                                                    styles.categoryButtonTextActive,
                                                ]}
                                            >
                                                {category}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Cuenta asociada */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Cuenta asociada (opcional)</Text>
                                {accounts.length === 0 ? (
                                    <Text style={styles.helperText}>
                                        Primero debes crear una cuenta en la sección "Resumen"
                                    </Text>
                                ) : (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.accountsScroll}
                                    >
                                        <Pressable
                                            style={[
                                                styles.accountButton,
                                                !newBudget.accountId && styles.accountButtonActive,
                                            ]}
                                            onPress={() =>
                                                setNewBudget({ ...newBudget, accountId: undefined })
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.accountButtonText,
                                                    !newBudget.accountId && styles.accountButtonTextActive,
                                                ]}
                                            >
                                                Ninguna
                                            </Text>
                                        </Pressable>
                                        {accounts.map(account => (
                                            <Pressable
                                                key={account.id}
                                                style={[
                                                    styles.accountButton,
                                                    newBudget.accountId === account.id &&
                                                    styles.accountButtonActive,
                                                ]}
                                                onPress={() =>
                                                    setNewBudget({
                                                        ...newBudget,
                                                        accountId:
                                                            newBudget.accountId === account.id
                                                                ? undefined
                                                                : account.id,
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
                                                        newBudget.accountId === account.id
                                                            ? COLORS.primary
                                                            : COLORS.textSecondary
                                                    }
                                                />
                                                <Text
                                                    style={[
                                                        styles.accountButtonText,
                                                        newBudget.accountId === account.id &&
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
                        </ScrollView>

                        {/* Botones de acción */}
                        <View style={styles.modalActions}>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowAddModal(false);
                                    resetNewBudgetForm();
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.modalButton,
                                    styles.saveButton,
                                    (!newBudget.name || !newBudget.amount) && styles.saveButtonDisabled,
                                ]}
                                onPress={handleCreateBudget}
                                disabled={!newBudget.name || !newBudget.amount}
                            >
                                <Text style={styles.saveButtonText}>Crear Presupuesto</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para editar presupuesto */}
            {editingBudget && (
                <Modal
                    visible={!!editingBudget}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setEditingBudget(null)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Editar Presupuesto</Text>
                                <Pressable
                                    onPress={() => setEditingBudget(null)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                                </Pressable>
                            </View>

                            <ScrollView style={styles.modalForm}>
                                {/* Formulario de edición */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nombre</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editingBudget.name}
                                        onChangeText={value =>
                                            setEditingBudget({ ...editingBudget, name: value })
                                        }
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Monto total</Text>
                                    <View style={styles.amountInputContainer}>
                                        <Text style={styles.currencySymbol}>$</Text>
                                        <TextInput
                                            style={styles.amountInput}
                                            value={editingBudget.amount.toString()}
                                            onChangeText={value =>
                                                setEditingBudget({
                                                    ...editingBudget,
                                                    amount: parseFloat(value) || 0,
                                                })
                                            }
                                            keyboardType="numeric"
                                        />
                                        <Text style={styles.currencyLabel}>CLP</Text>
                                    </View>
                                </View>

                                {/* Botones de acción para edición */}
                                <View style={styles.editActions}>
                                    <Pressable
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setEditingBudget(null)}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.modalButton, styles.saveButton]}
                                        onPress={handleUpdateBudget}
                                    >
                                        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                                    </Pressable>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

// Estilos (añade TextInput y otros componentes necesarios)
import { TextInput } from 'react-native';

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
    statsCard: {
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    spentValue: {
        color: COLORS.error,
    },
    remainingValue: {
        color: COLORS.success,
    },
    progressContainer: {
        marginTop: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    filtersCard: {
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
    },
    periodFilters: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary + '20',
    },
    filterButtonText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    filterButtonTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    statusFilters: {
        flexDirection: 'row',
        gap: 8,
    },
    statusButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    statusButtonActive: {
        backgroundColor: COLORS.primary + '20',
    },
    statusButtonText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    statusButtonTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    budgetsList: {
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
        marginBottom: 24,
        lineHeight: 20,
    },
    createButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    createButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    budgetCard: {
        marginBottom: 12,
        padding: 16,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    budgetTitleContainer: {
        flex: 1,
    },
    budgetName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    periodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    periodText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.primary,
    },
    budgetActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 4,
    },
    budgetProgress: {
        marginBottom: 12,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    progressPercentage: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.success,
    },
    exceededText: {
        color: COLORS.error,
    },
    warningText: {
        color: COLORS.warning,
    },
    remainingText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    budgetDates: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    budgetAccount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    accountText: {
        fontSize: 12,
        color: COLORS.textSecondary,
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
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
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
    periodButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    periodButton: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        minWidth: 80,
    },
    periodButtonActive: {
        backgroundColor: COLORS.primary + '20',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    periodButtonText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    periodButtonTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
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
    dateText1: {
        fontSize: 16,
        color: COLORS.textPrimary,
        marginLeft: 12,
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
    helperText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    modalActions: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        gap: 12,
    },
    editActions: {
        flexDirection: 'row',
        marginTop: 24,
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