import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDebts, getMembers, ensureSeeded, type Member } from '../../lib/store';

export default function SettleScreen() {
  const [debts, setDebts] = useState<{ fromId: string; toId: string; amount: number }[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await ensureSeeded();
    setDebts(await getDebts());
    setMembers(await getMembers());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const memberMap = new Map(members.map(m => [m.id, m]));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <Text style={styles.header}>Settle Up</Text>
        {debts.map((d, i) => {
          const from = memberMap.get(d.fromId);
          const to = memberMap.get(d.toId);
          return (
            <View key={i} style={styles.debtCard}>
              <View style={styles.avatarFrom}>
                <Text style={styles.avatarText}>{from?.initials || '?'}</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.arrow}>→</Text>
                <Text style={styles.debtAmount}>${d.amount.toFixed(2)}</Text>
              </View>
              <View style={[styles.avatarTo, { backgroundColor: to?.color || '#666' }]}>
                <Text style={styles.avatarText}>{to?.initials || '?'}</Text>
              </View>
            </View>
          );
        })}
        {debts.length === 0 && (
          <View style={styles.allClear}>
            <Text style={styles.allClearEmoji}>✓</Text>
            <Text style={styles.allClearText}>All settled up!</Text>
            <Text style={styles.allClearSub}>No outstanding balances.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 16 },
  header: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
  debtCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1c1c2e', borderRadius: 16, padding: 18, marginBottom: 10,
  },
  avatarFrom: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF9500',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarTo: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  arrow: { fontSize: 20, color: '#666' },
  debtAmount: { fontSize: 16, fontWeight: '700', color: '#FF9500', marginTop: 2 },
  allClear: { alignItems: 'center', marginTop: 60 },
  allClearEmoji: { fontSize: 56 },
  allClearText: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 12 },
  allClearSub: { fontSize: 14, color: '#888', marginTop: 4 },
});
