import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';

// ── Data ─────────────────────────────────────────────────────────────────────
const budgetCategories = [
  {
    id: '1', name: 'Housing', sub: 'Rent & Utilities', icon: 'home-outline' as const,
    color: Colors.green, spent: 1200, limit: 1200, status: 'good',
  },
  {
    id: '2', name: 'Groceries', sub: 'Weekly supplies', icon: 'basket-outline' as const,
    color: Colors.blue, spent: 225, limit: 500, status: 'good',
  },
  {
    id: '3', name: 'Entertainment', sub: 'Dining & Movies', icon: 'film-outline' as const,
    color: Colors.amber, spent: 275, limit: 300, status: 'warning',
  },
  {
    id: '4', name: 'Transport', sub: 'Fuel & Repairs', icon: 'car-outline' as const,
    color: Colors.red, spent: 215.8, limit: 200, status: 'over',
  },
];

function ProgressBar({ spent, limit, status }: { spent: number; limit: number; status: string }) {
  const pct = Math.min((spent / limit) * 100, 100);
  const color = status === 'over' ? Colors.red : status === 'warning' ? Colors.amber : Colors.green;
  const isPaid = spent >= limit && status !== 'over';
  return (
    <View style={{ marginTop: 10 }}>
      {isPaid && (
        <Text style={[styles.progressStatus, { color: Colors.green, marginBottom: 4 }]}>PAID</Text>
      )}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <View style={styles.progressLabels}>
        {status === 'over' ? (
          <Text style={[styles.progressStatus, { color: Colors.red }]}>OVER BUDGET</Text>
        ) : status === 'warning' ? (
          <Text style={[styles.progressStatus, { color: Colors.amber }]}>NEAR LIMIT</Text>
        ) : isPaid ? (
          <View />
        ) : (
          <Text style={[styles.progressStatus, { color: Colors.green }]}>SAFE</Text>
        )}
        <Text style={styles.progressPct}>{pct.toFixed(0)}% used</Text>
      </View>
      {status === 'over' && (
        <Text style={styles.overAmount}>+${(spent - limit).toFixed(2)}</Text>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function BudgetScreen() {
  const totalBudget = 3200;
  const totalSpent = 2415.8;
  const remaining = totalBudget - totalSpent;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
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

        {/* Budget Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Monthly Budget</Text>
          <Text style={styles.summaryAmount}>${totalBudget.toFixed(2)}</Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summarySubLabel}>SPENT</Text>
              <Text style={styles.summarySpent}>${totalSpent.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View>
              <Text style={styles.summarySubLabel}>REMAINING</Text>
              <Text style={styles.summaryRemaining}>${remaining.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={14} color={Colors.green} />
            <Text style={styles.editBtnText}>Edit Budgets</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesList}>
          {budgetCategories.map((cat, idx) => (
            <View
              key={cat.id}
              style={[styles.catCard, idx < budgetCategories.length - 1 && styles.catBorder]}>
              <View style={styles.catRow}>
                <View style={[styles.catIcon, { backgroundColor: cat.color + '22' }]}>
                  <Ionicons name={cat.icon} size={20} color={cat.color} />
                </View>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catSub}>{cat.sub}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.catSpent}>${cat.spent.toFixed(2)}</Text>
                  <Text style={styles.catLimit}>of ${cat.limit.toFixed(2)}</Text>
                </View>
              </View>
              <ProgressBar spent={cat.spent} limit={cat.limit} status={cat.status} />
            </View>
          ))}
        </View>

        {/* Bottom Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="trending-down" size={16} color={Colors.red} />
            <Text style={styles.statLabel}>Vs Last Month</Text>
            <Text style={[styles.statValue, { color: Colors.red }]}>-12% Spend</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="save-outline" size={16} color={Colors.green} />
            <Text style={styles.statLabel}>Projected Save</Text>
            <Text style={[styles.statValue, { color: Colors.green }]}>$420.00</Text>
          </View>
        </View>
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

  summaryCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 24, marginHorizontal: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  summaryLabel: { color: Colors.textSub, fontSize: 13, marginBottom: 6 },
  summaryAmount: { color: Colors.text, fontSize: 32, fontWeight: '800', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  summarySubLabel: { color: Colors.textMuted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  summarySpent: { color: Colors.red, fontSize: 18, fontWeight: '700' },
  summaryRemaining: { color: Colors.green, fontSize: 18, fontWeight: '700' },
  summaryDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  categoriesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  categoriesTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { color: Colors.green, fontSize: 13, fontWeight: '600' },

  categoriesList: { backgroundColor: Colors.card, borderRadius: 16, marginHorizontal: 20, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 16 },
  catCard: { padding: 16 },
  catBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border + '66' },
  catRow: { flexDirection: 'row', alignItems: 'center' },
  catIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  catInfo: { flex: 1 },
  catName: { color: Colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  catSub: { color: Colors.textMuted, fontSize: 12 },
  catSpent: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  catLimit: { color: Colors.textMuted, fontSize: 12 },

  progressTrack: { height: 8, backgroundColor: Colors.cardAlt, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  progressStatus: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  progressPct: { color: Colors.textMuted, fontSize: 11 },
  overAmount: { color: Colors.red, fontSize: 13, fontWeight: '700', marginTop: 2, textAlign: 'right' },

  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 16, alignItems: 'flex-start', gap: 6, borderWidth: 1, borderColor: Colors.border },
  statLabel: { color: Colors.textMuted, fontSize: 12 },
  statValue: { fontSize: 15, fontWeight: '700' },

  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.green, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
});
