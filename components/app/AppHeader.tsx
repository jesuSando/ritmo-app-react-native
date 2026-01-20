import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  title?: string;
  description?: string;
  subtitle?: string;
};

export function AppHeader({ title, description, subtitle }: Props) {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary, COLORS.accent]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.row}>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.menuButton}
          hitSlop={10}
        >
          <Ionicons name="menu" size={26} color="white" />
        </Pressable>

        <View style={styles.textBlock}>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuButton: {
    marginTop: 4,
    marginRight: 16,
  },

  textBlock: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
    lineHeight: 32,
  },

  description: {
    marginTop: 4,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
});
