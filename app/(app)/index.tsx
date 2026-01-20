import { AppHeader } from '@/components/app/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth/useAuth';
import { Card } from '../../components/card';
import { COLORS } from '../../constants/colors';
import { useFinanceAccounts } from '../../hooks/useFinanceAccounts';
import { formatCurrency } from '../../utils/formatters';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { totalBalance, loading } = useFinanceAccounts();

  return (
    <ScrollView style={styles.container}>
      <AppHeader
        title={`Hola, ${user?.name ?? ''}`}
        subtitle={
          new Date().toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        description='Bienvenido de nuevo a Ritmo'
      />

      <View style={styles.quickStats}>
        <Card style={styles.statCard}>
          <Ionicons name="wallet" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>
            {loading ? '...' : formatCurrency(totalBalance, 'CLP')}
          </Text>
          <Text style={styles.statLabel}>Balance Total</Text>
          <Pressable
            style={styles.statButton}
            onPress={() => router.push('/finances')}
          >
            <Text style={styles.statButtonText}>Ver Finanzas</Text>
          </Pressable>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>0/5</Text>
          <Text style={styles.statLabel}>Tareas Hoy</Text>
          <Pressable
            style={styles.statButton}
          // onPress={() => router.push('/tasks')}
          >
            <Text style={styles.statButtonText}>Ver Tareas</Text>
          </Pressable>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acceso Rápido</Text>
        <View style={styles.quickActions}>
          <Pressable
            style={styles.actionCard}
          // onPress={() => router.push('/finances/transactions?type=income')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="add-circle" size={32} color="#10b981" />
            </View>
            <Text style={styles.actionTitle}>Nuevo Ingreso</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
          // onPress={() => router.push('/tasks')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#3b82f620' }]}>
              <Ionicons name="add-circle" size={32} color="#3b82f6" />
            </View>
            <Text style={styles.actionTitle}>Nueva Tarea</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
          // onPress={() => router.push('/habits')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8b5cf620' }]}>
              <Ionicons name="add-circle" size={32} color="#8b5cf6" />
            </View>
            <Text style={styles.actionTitle}>Registrar Hábito</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
          // onPress={() => router.push('/notes')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="add-circle" size={32} color="#f59e0b" />
            </View>
            <Text style={styles.actionTitle}>Nueva Nota</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Módulos</Text>
        <Card style={styles.modulesCard}>
          <Pressable
            style={styles.moduleItem}
            onPress={() => router.push('/finances')}
          >
            <Ionicons name="wallet" size={24} color={COLORS.primary} />
            <Text style={styles.moduleText}>Finanzas</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.moduleItem}
          // onPress={() => router.push('/tasks')}
          >
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <Text style={styles.moduleText}>Tareas & Tiempo</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.moduleItem}
          // onPress={() => router.push('/habits')}
          >
            <Ionicons name="repeat" size={24} color={COLORS.primary} />
            <Text style={styles.moduleText}>Hábitos</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.moduleItem}
          // onPress={() => router.push('/notes')}
          >
            <Ionicons name="journal" size={24} color={COLORS.primary} />
            <Text style={styles.moduleText}>Diario Personal</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </Pressable>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  quickStats: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  statButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexBasis: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  modulesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  moduleText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
});