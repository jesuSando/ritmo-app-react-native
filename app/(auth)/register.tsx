import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { register } from '../../auth/auth.service';
import { useDatabase } from '../../db/useDatabase';

export default function RegisterScreen() {
    const router = useRouter();
    const db = useDatabase();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!db) return null;

    const handleRegister = async () => {
        try {
            setLoading(true);
            await register(db, name.trim(), email.trim(), password);
            router.replace('/(app)');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 24 }}>
            <Text style={{ fontSize: 24, marginBottom: 16 }}>Registro</Text>

            <TextInput
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
                style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
            />

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
                title={loading ? 'Creando...' : 'Registrarse'}
                onPress={handleRegister}
                disabled={loading}
            />

            <Text
                style={{ marginTop: 16, color: 'blue' }}
                onPress={() => router.back()}
            >
                Ya tengo cuenta
            </Text>
        </View>
    );
}
