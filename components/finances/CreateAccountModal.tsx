import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
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

type AccountType = 'cash' | 'bank_account' | 'credit_card' | 'digital_wallet' | 'savings';

const ACCOUNT_TYPES = [
    {
        type: 'cash',
        label: 'Efectivo',
        icon: 'cash',
        color: '#10b981',
    },
    {
        type: 'bank_account',
        label: 'Cuenta Bancaria',
        icon: 'business',
        color: '#3b82f6',
    },
    {
        type: 'credit_card',
        label: 'Tarjeta de Crédito',
        icon: 'card',
        color: '#f59e0b',
    },
    {
        type: 'digital_wallet',
        label: 'Billetera Digital',
        icon: 'phone-portrait',
        color: '#8b5cf6',
    },
    {
        type: 'savings',
        label: 'Ahorros',
        icon: 'trending-up',
        color: '#06b6d4',
    },
];

interface CreateAccountModalProps {
    visible: boolean;
    onClose: () => void;
    onCreateAccount: (
        name: string,
        type: AccountType,
        currency: string,
        initialBalance: number
    ) => Promise<void>;
}

export function CreateAccountModal({
    visible,
    onClose,
    onCreateAccount
}: CreateAccountModalProps) {
    const [name, setName] = useState('');
    const [selectedType, setSelectedType] = useState<AccountType>('cash');
    const [initialBalance, setInitialBalance] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre para la cuenta');
            return;
        }

        const balance = parseFloat(initialBalance) || 0;

        if (balance < 0) {
            Alert.alert('Error', 'El balance inicial no puede ser negativo');
            return;
        }

        setIsSubmitting(true);
        try {
            await onCreateAccount(name.trim(), selectedType, 'CLP', balance);
            resetForm();
            onClose();
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la cuenta');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setSelectedType('cash');
        setInitialBalance('');
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Nueva Cuenta</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.form}>
                        {/* Nombre de la cuenta */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre de la cuenta</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Cuenta Corriente, Efectivo, etc."
                                value={name}
                                onChangeText={setName}
                                maxLength={50}
                            />
                        </View>

                        {/* Tipo de cuenta */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tipo de cuenta</Text>
                            <View style={styles.typeGrid}>
                                {ACCOUNT_TYPES.map((accountType) => (
                                    <Pressable
                                        key={accountType.type}
                                        style={[
                                            styles.typeOption,
                                            selectedType === accountType.type && {
                                                backgroundColor: `${accountType.color}20`,
                                                borderColor: accountType.color,
                                            },
                                        ]}
                                        onPress={() => setSelectedType(accountType.type as AccountType)}
                                    >
                                        <View
                                            style={[
                                                styles.typeIcon,
                                                { backgroundColor: `${accountType.color}15` },
                                            ]}
                                        >
                                            <Ionicons
                                                name={accountType.icon as any}
                                                size={24}
                                                color={accountType.color}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.typeLabel,
                                                selectedType === accountType.type && {
                                                    color: accountType.color,
                                                    fontWeight: '600',
                                                },
                                            ]}
                                        >
                                            {accountType.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Balance inicial */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Balance inicial</Text>
                            <View style={styles.balanceInputContainer}>
                                <Text style={styles.currencySymbol}>$</Text>
                                <TextInput
                                    style={styles.balanceInput}
                                    placeholder="0"
                                    value={initialBalance}
                                    onChangeText={setInitialBalance}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                />
                                <Text style={styles.currencyLabel}>CLP</Text>
                            </View>
                            <Text style={styles.helperText}>
                                Si dejas este campo vacío, se establecerá en $0
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Botones de acción */}
                    <View style={styles.modalActions}>
                        <Pressable
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.createButton, isSubmitting && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Text style={styles.createButtonText}>Creando...</Text>
                            ) : (
                                <Text style={styles.createButtonText}>Crear Cuenta</Text>
                            )}
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
        maxHeight: '85%',
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
    form: {
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
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    typeOption: {
        width: '48%',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    typeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    balanceInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    currencySymbol: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginRight: 4,
    },
    balanceInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    currencyLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    helperText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 8,
    },
    modalActions: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        gap: 12,
    },
    button: {
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
    createButton: {
        backgroundColor: COLORS.primary,
    },
    disabledButton: {
        opacity: 0.6,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});