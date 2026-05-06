import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';

// ── Data ─────────────────────────────────────────────────────────────────────
const transactions = [
  { id: '1', group: 'TODAY, OCT 24', merchant: 'Apple Store', sub: 'Electronic & Gadgets', category: 'shopping', amount: -999.0, positive: false },
  { id: '2', group: 'TODAY, OCT 24', merchant: 'Salary Deposit', sub: 'Monthly Income', category: 'income', amount: 4250.0, positive: true },
  { id: '3', group: 'YESTERDAY, OCT 23', merchant: 'Shell Station', sub: 'Transport', category: 'transport', amount: -64.2, positive: false },
  { id: '4', group: 'YESTERDAY, OCT 23', merchant: 'The Bistro', sub: 'Dining Out', category: 'dining', amount: -120.5, positive: false },
  { id: '5', group: 'OCT 22, 2023', merchant: 'Walmart', sub: 'Groceries', category: 'shopping', amount: -145.1, positive: false },
];

const categories = ['All', 'Shopping', 'Transport', 'Dining'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function categoryIcon(cat: string): React.ComponentProps<typeof Ionicons>['name'] {
  switch (cat) {
    case 'shopping': return 'cart-outline';
    case 'dining': return 'restaurant-outline';
    case 'transport': return 'car-outline';
    case 'income': return 'cash-outline';
    default: return 'ellipse-outline';
  }
}

function categoryColor(cat: string): string {
  switch (cat) {
    case 'shopping': return Colors.blue;
    case 'dining': return Colors.amber;
    case 'transport': return Colors.teal;
    case 'income': return Colors.green;
    default: return Colors.textSub;
  }
}

// ── Group transactions by date label ─────────────────────────────────────────
function groupBy<T extends { group: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ActivityScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = transactions.filter((t) => {
    const matchSearch = t.merchant.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      activeFilter === 'All' || t.category.toLowerCase() === activeFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  const grouped = groupBy(filtered);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Ionicons name="wallet-outline" size={18} color={Colors.green} />
          </View>
          <Text style={styles.logoText}>FinanceFlow</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color={Colors.text} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, activeFilter === cat && styles.chipActive]}
            onPress={() => setActiveFilter(cat)}>
            <Text style={[styles.chipText, activeFilter === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}>
        {Object.entries(grouped).map(([group, items]) => (
          <View key={group}>
            <Text style={styles.groupLabel}>{group}</Text>
            <View style={styles.groupCard}>
              {items.map((item, idx) => (
                <View
                  key={item.id}
                  style={[styles.txRow, idx < items.length - 1 && styles.txBorder]}>
                  <View style={[styles.txIcon, { backgroundColor: categoryColor(item.category) + '22' }]}>
                    <Ionicons name={categoryIcon(item.category)} size={20} color={categoryColor(item.category)} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txMerchant}>{item.merchant}</Text>
                    <Text style={styles.txSub}>{item.sub}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: item.positive ? Colors.green : Colors.red }]}>
                    {item.positive ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => router.push('/add-expense' as any)}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { width: 34, height: 34, borderRadius: 8, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15 },

  chips: { marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  chipText: { color: Colors.textSub, fontSize: 14, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  groupLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 16, marginBottom: 8 },
  groupCard: { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },

  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  txBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border + '66' },
  txIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txMerchant: { color: Colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  txSub: { color: Colors.textMuted, fontSize: 12 },
  txAmount: { fontSize: 15, fontWeight: '700' },

  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.green, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
});
