import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

const COLORS = {
    primary: "#7870e6",
    secondary: "#b06ecc",
    accent: "#ff7588",
};

export default function AuthLayout() {
    return (
        <LinearGradient
            colors={[COLORS.primary, COLORS.secondary, COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' },
                }}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
