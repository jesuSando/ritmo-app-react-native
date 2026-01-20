import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth/useAuth';
import { Card } from '../../components/card';
import { COLORS } from '../../constants/colors';
import { useFinanceAccounts } from '../../hooks/useFinanceAccounts';
import { formatCurrency } from '../../utils/formatters';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { accounts, totalBalance, loading } = useFinanceAccounts();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          ¡Hola, {user?.name}!
        </Text>
        <Text style={styles.subtitle}>
          Bienvenido a tu gestor personal
        </Text>
      </View>

      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance Total</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(totalBalance, 'CLP')}
        </Text>
        <Text style={styles.balanceSubtitle}>
          {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}
        </Text>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen Financiero</Text>
        {accounts.map(account => (
          <Card key={account.id} style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={[
                styles.accountType,
                { backgroundColor: getAccountColor(account.type) }
              ]}>
                {account.type}
              </Text>
            </View>
            <Text style={styles.accountBalance}>
              {formatCurrency(account.current_balance, account.currency)}
            </Text>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximas Tareas</Text>
        <Card style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            No hay tareas pendientes para hoy
          </Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hábitos de Hoy</Text>
        <Card style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Registra tus hábitos diarios
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

function getAccountColor(type: string) {
  const colors: Record<string, string> = {
    cash: '#10b981',
    bank_account: '#3b82f6',
    credit_card: '#f59e0b',
    digital_wallet: '#8b5cf6',
    savings: '#06b6d4',
  };
  return colors[type] || '#6b7280';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: COLORS.primary,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  balanceCard: {
    margin: 20,
    marginTop: -40,
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginVertical: 8,
  },
  balanceSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  accountCard: {
    marginBottom: 12,
    padding: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  accountType: {
    fontSize: 12,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  placeholderCard: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});