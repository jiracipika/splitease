import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getExpenses, getMembers, getGroups, ensureSeeded, CATEGORIES, type Expense, type Member, type Group } from '../../lib/store';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await ensureSeeded();
    setExpenses(await getExpenses());
    setMembers(await getMembers());
    setGroups(await getGroups());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const memberMap = new Map(members.map(m => [m.id, m]));
  const groupMap = new Map(groups.map(g => [g.id, g]));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <Text style={styles.header}>All Expenses</Text>
        {expenses.map(exp => {
          const payer = memberMap.get(exp.paidById);
          const group = groupMap.get(exp.groupId);
          const cat = CATEGORIES[exp.category];
          return (
            <View key={exp.id} style={styles.expenseCard}>
              <View style={styles.expenseTop}>
                <Text style={styles.expenseEmoji}>{cat?.emoji || '📦'}</Text>
                <Text style={styles.expenseDesc}>{exp.description}</Text>
                <Text style={styles.expenseAmount}>${exp.amount.toFixed(2)}</Text>
              </View>
              <View style={styles.expenseMeta}>
                <Text style={styles.metaText}>Paid by {payer?.name || '?'}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{group?.name || 'Unknown'}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{cat?.label || 'Other'}</Text>
              </View>
            </View>
          );
        })}
        {expenses.length === 0 && (
          <Text style={styles.emptyText}>No expenses yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 16 },
  header: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
  expenseCard: {
    backgroundColor: '#1c1c2e', borderRadius: 16, padding: 16, marginBottom: 10,
  },
  expenseTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  expenseEmoji: { fontSize: 24 },
  expenseDesc: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff' },
  expenseAmount: { fontSize: 18, fontWeight: '800', color: '#34C759' },
  expenseMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginLeft: 34 },
  metaText: { fontSize: 12, color: '#888' },
  metaDot: { fontSize: 12, color: '#444' },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 20 },
});
