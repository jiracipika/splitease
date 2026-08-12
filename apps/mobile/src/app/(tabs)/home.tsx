import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGroups, getExpenses, getMembers, ensureSeeded, CATEGORIES, type Group, type Expense, type Member } from '../../lib/store';

export default function HomeScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await ensureSeeded();
    setGroups(await getGroups());
    setExpenses(await getExpenses());
    setMembers(await getMembers());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const memberMap = new Map(members.map(m => [m.id, m]));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Tracked</Text>
          <Text style={styles.heroAmount}>${totalSpent.toFixed(2)}</Text>
          <View style={styles.heroRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{groups.length}</Text>
              <Text style={styles.heroStatLabel}>Groups</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{expenses.length}</Text>
              <Text style={styles.heroStatLabel}>Expenses</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{members.length}</Text>
              <Text style={styles.heroStatLabel}>Members</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        {expenses.slice(0, 5).map(exp => {
          const payer = memberMap.get(exp.paidById);
          const cat = CATEGORIES[exp.category];
          return (
            <View key={exp.id} style={styles.expenseRow}>
              <Text style={styles.expenseEmoji}>{cat?.emoji || '📦'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.expenseDesc}>{exp.description}</Text>
                <Text style={styles.expensePayer}>Paid by {payer?.name || 'Unknown'}</Text>
              </View>
              <Text style={styles.expenseAmount}>${exp.amount.toFixed(2)}</Text>
            </View>
          );
        })}
        {expenses.length === 0 && (
          <Text style={styles.emptyText}>No expenses yet. Pull to refresh.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 16 },
  heroCard: {
    backgroundColor: '#1c1c2e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroLabel: { fontSize: 13, color: '#888', marginBottom: 4 },
  heroAmount: { fontSize: 40, fontWeight: '800', color: '#fff', marginBottom: 20 },
  heroRow: { flexDirection: 'row', gap: 32 },
  heroStat: { alignItems: 'center' },
  heroStatNum: { fontSize: 22, fontWeight: '700', color: '#34C759' },
  heroStatLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  expenseRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1c1c2e', borderRadius: 14, padding: 14, marginBottom: 8,
  },
  expenseEmoji: { fontSize: 24 },
  expenseDesc: { fontSize: 15, fontWeight: '600', color: '#fff' },
  expensePayer: { fontSize: 12, color: '#888', marginTop: 2 },
  expenseAmount: { fontSize: 16, fontWeight: '700', color: '#fff' },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 20 },
});
