import { useAuth } from '@/auth/useAuth';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function AppDrawerContent(props: any) {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.appName}>Ritmo ;)</Text>
                {user && <Text style={styles.userName}>{user.name}</Text>}
            </View>

            <View style={styles.items}>
                <DrawerItemList {...props} />
            </View>

            <View style={styles.footer}>
                <Pressable style={styles.logout} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                </Pressable>
            </View>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        padding: 20,
        backgroundColor: "#7870e620",
        borderRadius: 8
    },

    appName: {
        color: COLORS.primary,
        fontSize: 32,
        fontWeight: '700',
    },

    userName: {
        marginTop: 4,
        color: COLORS.primary,
        fontSize: 14,
    },

    items: {
        flex: 1,
        paddingTop: 8,
    },

    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },

    logout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    logoutText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
});

