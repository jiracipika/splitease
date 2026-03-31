import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: '#0a0a0f' },
      headerTintColor: '#fff',
      tabBarStyle: { backgroundColor: '#0a0a0f', borderTopColor: '#1a1a2e' },
      tabBarActiveTintColor: '#a78bfa',
    }}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="groups" options={{ title: "Groups" }} />
      <Tabs.Screen name="expenses" options={{ title: "Expenses" }} />
      <Tabs.Screen name="settle" options={{ title: "Settle" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
    </Tabs>
  );
}
