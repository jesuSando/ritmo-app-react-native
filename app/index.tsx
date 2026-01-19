import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable onPress={() => router.push({ pathname: '/dev/db' })}>
        <Text>Ver estado DB</Text>
      </Pressable>
    </View>
  );
}
