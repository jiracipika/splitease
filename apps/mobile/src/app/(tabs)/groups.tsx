import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGroups, getMembers, ensureSeeded, type Group, type Member } from '../../lib/store';

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await ensureSeeded();
    setGroups(await getGroups());
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
        <Text style={styles.header}>Your Groups</Text>
        {groups.map(g => (
          <View key={g.id} style={styles.groupCard}>
            <Text style={styles.groupEmoji}>{g.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.groupName}>{g.name}</Text>
              <Text style={styles.groupMembers}>
                {g.memberIds.map(id => memberMap.get(id)?.name || '?').join(', ')}
              </Text>
            </View>
            <Text style={styles.memberCount}>{g.memberIds.length}</Text>
          </View>
        ))}
        {groups.length === 0 && (
          <Text style={styles.emptyText}>No groups yet. Pull to refresh.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 16 },
  header: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 16 },
  groupCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1c1c2e', borderRadius: 16, padding: 16, marginBottom: 10,
  },
  groupEmoji: { fontSize: 32 },
  groupName: { fontSize: 17, fontWeight: '700', color: '#fff' },
  groupMembers: { fontSize: 13, color: '#888', marginTop: 4 },
  memberCount: {
    fontSize: 14, fontWeight: '700', color: '#34C759',
    backgroundColor: '#34C75922', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12,
  },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 20 },
});
