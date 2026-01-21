import { AppHeader } from '@/components/app/AppHeader';
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

    return (
        <ScrollView style={styles.container}>
            <AppHeader
                title="Finanzas"
                description="Control y seguimiento de tu dinero"
                subtitle='Todo en un solo lugar.'
            />

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
                                    color={active ? '#7870e6' : '#6b7280'}
                                />
                                <Text style={active ? styles.activeText : styles.text}>
                                    {tab.label}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            <View>
                <Slot />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabs: {
        marginHorizontal: 16,
        marginVertical: 8,
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
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
        color: '#6b7280',
    },
    activeText: {
        fontSize: 12,
        color: '#7870e6',
        fontWeight: '600',
    },
});
