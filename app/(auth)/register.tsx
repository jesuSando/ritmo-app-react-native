import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { register } from '../../auth/auth.service';
import Field from '../../components/field';
import { useDatabase } from '../../hooks/useDatabase';

const COLORS = {
    primary: "#7870e6",
    secondary: "#b06ecc",
    accent: "#ff7588",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    error: "#ef4444",
    white: "#ffffff",
};

type FormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export default function RegisterScreen() {
    const router = useRouter();
    const db = useDatabase();
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const password = watch('password');

    if (!db) return null;

    const handleRegister = async (data: FormData) => {
        try {
            setLoading(true);
            await register(db, data.name.trim(), data.email.trim(), data.password);
            Alert.alert('Éxito', 'Cuenta creada correctamente');
            router.replace('/(app)');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[COLORS.primary, COLORS.secondary, COLORS.accent]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.mobileFormContainer}>
                <View style={styles.mobileFormCard}>
                    <Text style={styles.title}>Crear Cuenta</Text>
                    <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>

                    <Controller
                        control={control}
                        name="name"
                        rules={{
                            required: "Nombre obligatorio",
                            minLength: {
                                value: 2,
                                message: "Mínimo 2 caracteres",
                            },
                        }}
                        render={({ field }) => (
                            <Field
                                type="text"
                                label="Nombre completo"
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                error={errors.name?.message}
                                editable={!loading}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: "Email obligatorio",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Email inválido",
                            },
                        }}
                        render={({ field }) => (
                            <Field
                                label="Email"
                                type="email"
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                error={errors.email?.message}
                                editable={!loading}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        rules={{
                            required: "Contraseña obligatoria",
                            minLength: {
                                value: 6,
                                message: "Mínimo 6 caracteres",
                            },
                        }}
                        render={({ field }) => (
                            <Field
                                label="Contraseña"
                                type="password"
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                error={errors.password?.message}
                                editable={!loading}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="confirmPassword"
                        rules={{
                            required: "Confirma tu contraseña",
                            validate: (value) => value === password || "Las contraseñas no coinciden",
                        }}
                        render={({ field }) => (
                            <Field
                                label="Confirmar contraseña"
                                type="password"
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                error={errors.confirmPassword?.message}
                                editable={!loading}
                            />
                        )}
                    />

                    <Pressable
                        onPress={handleSubmit(handleRegister)}
                        disabled={loading}
                        style={({ pressed }) => [styles.buttonContainer, { opacity: loading ? 0.6 : pressed ? 0.9 : 1 }]}
                    >
                        <LinearGradient
                            colors={[COLORS.accent, COLORS.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear Cuenta</Text>}
                        </LinearGradient>
                    </Pressable>

                    <Pressable
                        onPress={() => router.back()}
                        disabled={loading}
                        style={styles.linkContainer}
                    >
                        <Text style={styles.linkText}>
                            ¿Ya tienes cuenta? <Text style={styles.linkTextBold}>Inicia sesión</Text>
                        </Text>
                    </Pressable>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    mobileFormContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    mobileFormCard: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: COLORS.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    buttonContainer: {
        marginTop: 24,
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    button: {
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    linkContainer: {
        marginTop: 24,
    },
    linkText: {
        color: COLORS.textSecondary,
        textAlign: "center",
        fontSize: 14,
    },
    linkTextBold: {
        fontWeight: "bold",
        color: COLORS.primary,
    },
});