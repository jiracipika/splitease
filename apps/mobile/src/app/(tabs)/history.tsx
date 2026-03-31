import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎨</Text>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888' },
});
