// app/components/finances/CreateTransactionModal.tsx
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
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

interface Account {
    id: number;
    name: string;
    type: 'cash' | 'bank_account' | 'credit_card' | 'digital_wallet' | 'savings';
}

interface TransactionData {
    type: 'income' | 'expense';
    amount: string;
    category: string;
    description: string;
    accountId: number;
    date: string;
}

interface CreateTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onCreateTransaction: (transaction: {
        amount: number;
        type: 'income' | 'expense';
        category: string;
        date: string;
        accountId: number;
        description?: string;
    }) => Promise<void>;
    accounts: Account[];
}

export function CreateTransactionModal({
    visible,
    onClose,
    onCreateTransaction,
    accounts
}: CreateTransactionModalProps) {
    const [transaction, setTransaction] = useState<TransactionData>({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        accountId: accounts[0]?.id || 0,
        date: format(new Date(), 'yyyy-MM-dd'),
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!transaction.amount || parseFloat(transaction.amount) <= 0) {
            Alert.alert('Error', 'Por favor ingresa un monto válido');
            return;
        }

        if (!transaction.category) {
            Alert.alert('Error', 'Por favor selecciona una categoría');
            return;
        }

        if (!transaction.accountId) {
            Alert.alert('Error', 'Por favor selecciona una cuenta');
            return;
        }

        setIsSubmitting(true);
        try {
            await onCreateTransaction({
                amount: parseFloat(transaction.amount),
                type: transaction.type,
                category: transaction.category,
                date: transaction.date,
                accountId: transaction.accountId,
                description: transaction.description || undefined,
            });
            
            // Reset form
            setTransaction({
                type: 'expense',
                amount: '',
                category: '',
                description: '',
                accountId: accounts[0]?.id || 0,
                date: format(new Date(), 'yyyy-MM-dd'),
            });
            onClose();
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la transacción');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setTransaction({
            type: 'expense',
            amount: '',
            category: '',
            description: '',
            accountId: accounts[0]?.id || 0,
            date: format(new Date(), 'yyyy-MM-dd'),
        });
        onClose();
    };

    const categories = transaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Nueva Transacción</Text>
                        <Pressable
                            onPress={handleClose}
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
                                        transaction.type === 'expense' &&
                                        styles.typeButtonActive,
                                        transaction.type === 'expense' && {
                                            backgroundColor: '#ef444420',
                                            borderColor: COLORS.error,
                                        },
                                    ]}
                                    onPress={() =>
                                        setTransaction({ ...transaction, type: 'expense' })
                                    }
                                >
                                    <Ionicons
                                        name="arrow-up"
                                        size={20}
                                        color={
                                            transaction.type === 'expense'
                                                ? COLORS.error
                                                : COLORS.textSecondary
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            transaction.type === 'expense' &&
                                            styles.typeButtonTextActive,
                                            transaction.type === 'expense' && {
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
                                        transaction.type === 'income' &&
                                        styles.typeButtonActive,
                                        transaction.type === 'income' && {
                                            backgroundColor: '#10b98120',
                                            borderColor: COLORS.success,
                                        },
                                    ]}
                                    onPress={() =>
                                        setTransaction({ ...transaction, type: 'income' })
                                    }
                                >
                                    <Ionicons
                                        name="arrow-down"
                                        size={20}
                                        color={
                                            transaction.type === 'income'
                                                ? COLORS.success
                                                : COLORS.textSecondary
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            transaction.type === 'income' &&
                                            styles.typeButtonTextActive,
                                            transaction.type === 'income' && {
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
                                    value={transaction.amount}
                                    onChangeText={value =>
                                        setTransaction({ ...transaction, amount: value })
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
                                {categories.map(category => (
                                    <Pressable
                                        key={category}
                                        style={[
                                            styles.categoryButton,
                                            transaction.category === category &&
                                            styles.categoryButtonActive,
                                        ]}
                                        onPress={() =>
                                            setTransaction({
                                                ...transaction,
                                                category,
                                            })
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.categoryButtonText,
                                                transaction.category === category &&
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
                                <Text style={styles.helperText}>
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
                                                transaction.accountId === account.id &&
                                                styles.accountButtonActive,
                                            ]}
                                            onPress={() =>
                                                setTransaction({
                                                    ...transaction,
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
                                                    transaction.accountId === account.id
                                                        ? COLORS.primary
                                                        : COLORS.textSecondary
                                                }
                                            />
                                            <Text
                                                style={[
                                                    styles.accountButtonText,
                                                    transaction.accountId === account.id &&
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
                                value={transaction.description}
                                onChangeText={value =>
                                    setTransaction({
                                        ...transaction,
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
                                        new Date(transaction.date),
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
                            onPress={handleClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.modalButton,
                                styles.saveButton,
                                (!transaction.amount ||
                                    !transaction.category ||
                                    !transaction.accountId) &&
                                styles.saveButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={
                                !transaction.amount ||
                                !transaction.category ||
                                !transaction.accountId ||
                                isSubmitting
                            }
                        >
                            <Text style={styles.saveButtonText}>
                                {isSubmitting ? 'Guardando...' : 'Guardar'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
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
    helperText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 12,
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