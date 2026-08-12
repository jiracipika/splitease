import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getExpenses, getMembers, ensureSeeded, CATEGORIES, type Expense, type Member } from '../../lib/store';

export default function HistoryScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await ensureSeeded();
    setExpenses(await getExpenses());
    setMembers(await getMembers());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const memberMap = new Map(members.map(m => [m.id, m]));

  // Group by date
  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const grouped: { [date: string]: Expense[] } = {};
  for (const e of sorted) {
    const d = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    (grouped[d] ||= []).push(e);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <Text style={styles.header}>History</Text>
        {Object.entries(grouped).map(([date, exps]) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {exps.map(exp => {
              const cat = CATEGORIES[exp.category];
              const payer = memberMap.get(exp.paidById);
              return (
                <View key={exp.id} style={styles.row}>
                  <Text style={styles.emoji}>{cat?.emoji || '📦'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.desc}>{exp.description}</Text>
                    <Text style={styles.payer}>{payer?.name || '?'}</Text>
                  </View>
                  <Text style={styles.amount}>${exp.amount.toFixed(2)}</Text>
                </View>
              );
            })}
          </View>
        ))}
        {expenses.length === 0 && (
          <Text style={styles.emptyText}>No history yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 16 },
  header: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
  dateHeader: { fontSize: 13, fontWeight: '700', color: '#666', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1c1c2e', borderRadius: 14, padding: 14, marginBottom: 8,
  },
  emoji: { fontSize: 24 },
  desc: { fontSize: 15, fontWeight: '600', color: '#fff' },
  payer: { fontSize: 12, color: '#888', marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '700', color: '#fff' },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 20 },
});
