import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useAuth } from '../../auth/useAuth';

export default function Index() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
      <Pressable onPress={() => router.push({ pathname: '/admin/db' })}>
        <Text>Ver estado DB</Text>
      </Pressable>

      <Pressable onPress={handleLogout}>
        <Text style={{ color: 'red' }}>Logout</Text>
      </Pressable>
    </View>
  );
}
