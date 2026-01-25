import { Card } from '@/components/card';
import { COLORS } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
    transactions: any[];
    accounts: any[];
    onDelete: (id: number) => void;
    formattedDate: string;
};

export function DayTransactionsList({
    transactions,
    accounts,
    onDelete,
    formattedDate
}: Props) {
    const [seeAll, setSeeAll] = useState(false);

    const visibleTransactions = seeAll
        ? transactions
        : transactions.slice(0, 3);

    return (
        <View style={{ marginBottom: 24, }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
            }}>
                <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: COLORS.textPrimary,
                    textTransform: 'capitalize',
                }}>{formattedDate}</Text>

                {transactions.length > 3 && (
                    <Pressable onPress={() => setSeeAll(!seeAll)}>
                        <Text
                            style={{
                                color: COLORS.primary,
                                fontWeight: '600',
                            }}
                        >
                            {seeAll ? 'Ver menos' : `Ver todas (${transactions.length})`}
                        </Text>
                    </Pressable>
                )}
            </View>
            {visibleTransactions.map(transaction => (


                <Card key={transaction.id} style={{ marginBottom: 8, padding: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 12,
                                    backgroundColor:
                                        transaction.type === 'income'
                                            ? '#10b98120'
                                            : '#ef444420',
                                }}
                            >
                                <Ionicons
                                    name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'}
                                    size={20}
                                    color={
                                        transaction.type === 'income'
                                            ? COLORS.success
                                            : COLORS.error
                                    }
                                />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '600' }}>
                                    {transaction.category}
                                </Text>
                                {transaction.description ? (
                                    <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
                                        {transaction.description}
                                    </Text>
                                ) : null}
                                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                                    {accounts.find(a => a.id === transaction.account_id)?.name ??
                                        'Cuenta'}
                                </Text>
                            </View>
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    color:
                                        transaction.type === 'income'
                                            ? COLORS.success
                                            : COLORS.error,
                                }}
                            >
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount, 'CLP')}
                            </Text>

                            <Pressable onPress={() => onDelete(transaction.id)}>
                                <Ionicons
                                    name="trash-outline"
                                    size={18}
                                    color={COLORS.textSecondary}
                                />
                            </Pressable>
                        </View>
                    </View>
                </Card>
            ))}
        </View>

    );
}
