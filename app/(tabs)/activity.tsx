import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type Tx = {
  id: string;
  group: 'Today' | 'Yesterday' | string;
  merchant: string;
  category: string;
  time: string;
  amount: number;
};

const TRANSACTIONS: Tx[] = [
  { id: '1', group: 'Today',     merchant: 'Lumber Jacket',    category: 'Shopping',  time: '11:21 AM', amount: -25 },
  { id: '2', group: 'Today',     merchant: 'Uber',             category: 'Transport', time: '09:45 AM', amount: -12.5 },
  { id: '3', group: 'Today',     merchant: 'Monthly Dividend', category: 'Income',    time: '08:00 AM', amount: 97 },
  { id: '4', group: 'Yesterday', merchant: 'Suya and Garri',   category: 'Dining',    time: '07:12 PM', amount: -18 },
  { id: '5', group: 'Yesterday', merchant: 'Electricity Bill', category: 'Bills',     time: '10:30 AM', amount: -34 },
];

const FILTERS = ['All', 'Shopping', 'Transport', 'Dining', 'Bills'] as const;
type Filter = (typeof FILTERS)[number];

const CATEGORY_ICONS: Record<string, IoniconsName> = {
  Shopping:  'bag-handle-outline',
  Transport: 'car-outline',
  Dining:    'restaurant-outline',
  Bills:     'flash-outline',
  Income:    'wallet-outline',
};

function formatUsd(value: number) {
  const sign = value < 0 ? '-' : '+';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function groupTotal(items: Tx[]) {
  const total = items.reduce((sum, t) => sum + t.amount, 0);
  const sign = total < 0 ? '-' : '+';
  return `${sign}$${Math.abs(total).toFixed(2)}`;
}

export default function ActivityScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter((t) => {
      const matchSearch = t.merchant.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'All' || t.category === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  const groups = useMemo(() => {
    const map = new Map<string, Tx[]>();
    for (const t of filtered) {
      if (!map.has(t.group)) map.set(t.group, []);
      map.get(t.group)!.push(t);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const total = useMemo(
    () => TRANSACTIONS.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0),
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={Colors.text} />
          </View>
          <Text style={styles.greeting}>Good morning, Jon</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textSub} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={Colors.textSub}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(f)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Total Spending hero */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Spending (Oct)</Text>
          <Text style={styles.totalAmount}>${Math.abs(total).toFixed(2)}</Text>
          <View style={styles.trendRow}>
            <Ionicons name="trending-down" size={16} color="#FFFFFF" />
            <Text style={styles.trendText}>12% lower than last month</Text>
          </View>
        </View>

        {/* Grouped transactions */}
        {groups.map(([group, items]) => (
          <View key={group} style={styles.groupSection}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{group}</Text>
              <Text style={styles.groupTotal}>{groupTotal(items)}</Text>
            </View>

            <View style={styles.groupCard}>
              {items.map((item, idx) => {
                const isIncome = item.amount >= 0;
                const icon = CATEGORY_ICONS[item.category] ?? 'pricetag-outline';
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.row,
                      idx < items.length - 1 && styles.rowDivider,
                    ]}>
                    <View
                      style={[
                        styles.rowIcon,
                        isIncome && { backgroundColor: Colors.incomeBg },
                      ]}>
                      <Ionicons
                        name={icon}
                        size={20}
                        color={isIncome ? Colors.income : Colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowMerchant}>{item.merchant}</Text>
                      <Text style={styles.rowSub}>
                        {item.category} • {item.time}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.rowAmount,
                        { color: isIncome ? Colors.income : Colors.red },
                      ]}>
                      {formatUsd(item.amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <Text style={styles.empty}>No transactions found.</Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => router.push('/add-expense' as any)}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  greeting: { fontSize: 18, fontWeight: '700', color: Colors.text },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.cardDark,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, padding: 0 },

  // Chips
  chipList: { gap: 8, paddingRight: 4, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.cardAlt,
  },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },

  // Total card
  totalCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  trendText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

  // Groups
  groupSection: { marginTop: 24 },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  groupTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  groupTotal: { fontSize: 12, fontWeight: '600', color: Colors.textSub },
  groupCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowMerchant: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  rowSub: { color: Colors.textSub, fontSize: 13 },
  rowAmount: { fontSize: 16, fontWeight: '700' },

  empty: { color: Colors.textSub, textAlign: 'center', marginTop: 32, fontSize: 14 },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
