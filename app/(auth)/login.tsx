import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { login } from '../../auth/auth.service';
import { useDatabase } from '../../db/useDatabase';

export default function LoginScreen() {
    const router = useRouter();
    const db = useDatabase();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!db) return null;

    const handleLogin = async () => {
        try {
            setLoading(true);
            await login(db, email.trim(), password);
            router.replace('/(app)');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 24 }}>
            <Text style={{ fontSize: 24, marginBottom: 16 }}>Login</Text>

            <TextInput
                placeholder="Email"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
            />

            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{ borderWidth: 1, marginBottom: 16, padding: 8 }}
            />

            <Button
                title={loading ? 'Entrando...' : 'Login'}
                onPress={handleLogin}
                disabled={loading}
            />

            <Text
                style={{ marginTop: 16, color: 'blue' }}
                onPress={() => router.push('/register')}
            >
                No tenés cuenta? Registrate
            </Text>
        </View>
    );
}
