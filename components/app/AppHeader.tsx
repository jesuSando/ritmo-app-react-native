import { COLORS } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

type Props = {
  title?: string;
  description?: string;
  subtitle?: string;
};

export function AppHeader({ title, description, subtitle }: Props) {
  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary, COLORS.accent]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.row}>

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
    paddingVertical: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuButton: {
    marginTop: 4,
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 50,
  },

  textBlock: {
    flex: 1,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    lineHeight: 32,
  },

  description: {
    marginTop: 4,
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
  },

  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});
