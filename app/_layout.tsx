import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../auth/useAuth';
import { initDB } from '../db/database';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    initDB().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Inicializando base de datos...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando autenticación...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}