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
const subscriptions = [
  { id: '1', name: 'Netflix', icon: 'tv-outline' as const, iconColor: Colors.red, amount: 15.99, cycle: 'MONTHLY', nextDate: 'Oct 13, 2023', status: 'active' },
  { id: '2', name: 'Spotify', icon: 'musical-notes-outline' as const, iconColor: '#1DB954', amount: 9.99, cycle: 'MONTHLY', nextDate: 'Oct 15, 2023', status: 'active' },
  { id: '3', name: "Gold's Gym", icon: 'barbell-outline' as const, iconColor: Colors.amber, amount: 45.0, cycle: 'MONTHLY', nextDate: 'Nov 01, 2023', status: 'active' },
  { id: '4', name: 'iCloud+ 2TB', icon: 'cloud-outline' as const, iconColor: Colors.blue, amount: 120.0, cycle: 'YEARLY', nextDate: 'Oct 28, 2023', status: 'active' },
  { id: '5', name: 'Adobe Creative Cloud', icon: 'color-palette-outline' as const, iconColor: Colors.red, amount: 52.99, cycle: 'MONTHLY', nextDate: 'Oct 01, 2023', status: 'overdue' },
];

const insights = [
  { id: '1', category: 'Entertainment', amount: 25.98 },
  { id: '2', category: 'Productivity', amount: 172.99 },
];

// ── Screen ────────────────────────────────────────────────────────────────────
export default function SubscriptionsScreen() {
  const totalMonthly = 154.2;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
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

        {/* Total Monthly Spend */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>TOTAL MONTHLY SPEND</Text>
          <Text style={styles.totalAmount}>${totalMonthly.toFixed(2)}<Text style={styles.totalPeriod}>/mo</Text></Text>
          <View style={styles.savingsBadge}>
            <Ionicons name="trending-down" size={14} color={Colors.green} />
            <Text style={styles.savingsBadgeText}> 4% less than last month</Text>
          </View>
        </View>

        {/* Savings Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconRow}>
            <Ionicons name="sparkles" size={18} color={Colors.green} />
          </View>
          <Text style={styles.tipText}>
            You could save $24.00 by switching to annual billing on 2 items.
          </Text>
        </View>

        {/* Active Subscriptions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Subscriptions</Text>
          <Text style={styles.sectionCount}>{subscriptions.length} Total</Text>
        </View>

        <View style={styles.subsList}>
          {subscriptions.map((sub, idx) => (
            <View
              key={sub.id}
              style={[styles.subRow, idx < subscriptions.length - 1 && styles.subBorder]}>
              <View style={[styles.subIcon, { backgroundColor: sub.iconColor + '22' }]}>
                <Ionicons name={sub.icon} size={20} color={sub.iconColor} />
              </View>
              <View style={styles.subInfo}>
                <Text style={styles.subName}>{sub.name}</Text>
                <Text style={[styles.subNext, sub.status === 'overdue' && { color: Colors.red }]}>
                  {sub.status === 'overdue' ? 'Overdue: ' : 'Next: '}{sub.nextDate}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.subAmount}>${sub.amount.toFixed(2)}</Text>
                <View style={[styles.cycleBadge, { backgroundColor: sub.cycle === 'YEARLY' ? Colors.amber + '22' : Colors.green + '22' }]}>
                  <Text style={[styles.cycleText, { color: sub.cycle === 'YEARLY' ? Colors.amber : Colors.green }]}>
                    {sub.cycle}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Spending Insights */}
        <Text style={styles.insightsTitle}>Spending Insights</Text>
        <View style={styles.insightsList}>
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <Text style={styles.insightCategory}>{insight.category}</Text>
              <Text style={styles.insightAmount}>${insight.amount.toFixed(2)} / mo</Text>
            </View>
          ))}
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

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { marginRight: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginLeft: 4 },
  logoBox: { width: 34, height: 34, borderRadius: 8, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },

  totalSection: { paddingHorizontal: 20, marginBottom: 16 },
  totalLabel: { color: Colors.textSub, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  totalAmount: { color: Colors.text, fontSize: 36, fontWeight: '800', marginBottom: 8 },
  totalPeriod: { fontSize: 18, fontWeight: '400', color: Colors.textSub },
  savingsBadge: { flexDirection: 'row', alignItems: 'center' },
  savingsBadgeText: { color: Colors.green, fontSize: 13, fontWeight: '500' },

  tipCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginHorizontal: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tipIconRow: { marginTop: 1 },
  tipText: { color: Colors.text, fontSize: 14, lineHeight: 20, flex: 1 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  sectionCount: { color: Colors.textSub, fontSize: 13 },

  subsList: { backgroundColor: Colors.card, borderRadius: 16, marginHorizontal: 20, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 24 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  subBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border + '66' },
  subIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  subInfo: { flex: 1 },
  subName: { color: Colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  subNext: { color: Colors.textMuted, fontSize: 12 },
  subAmount: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cycleBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  cycleText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  insightsTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', paddingHorizontal: 20, marginBottom: 12 },
  insightsList: { gap: 10, paddingHorizontal: 20 },
  insightCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border },
  insightCategory: { color: Colors.textSub, fontSize: 13, marginBottom: 4 },
  insightAmount: { color: Colors.text, fontSize: 18, fontWeight: '700' },

  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.green, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
});
