import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const RING_SIZE = 128;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

const TOTAL_SPENT = 4280.5;
const BUDGET = 5000;
const USED_PCT = TOTAL_SPENT / BUDGET; // 0.856

const INSIGHTS: { id: string; title: string; body: string; icon: IoniconsName; iconColor: string; bg: string }[] = [
  {
    id: 'i1',
    title: 'Dining Increase',
    body: 'You spent 15% more on dining this month compared to August.',
    icon: 'trending-up',
    iconColor: Colors.red,
    bg: 'rgba(186,26,26,0.10)',
  },
  {
    id: 'i2',
    title: 'Saving Opportunity',
    body: 'Switching to annual billing for Netflix could save you $24/year.',
    icon: 'wallet-outline',
    iconColor: Colors.income,
    bg: Colors.incomeBg,
  },
];

const CATEGORIES: {
  id: string;
  name: string;
  amount: number;
  pct: number;
  icon: IoniconsName;
  iconColor: string;
  iconBg: string;
  barColor: string;
}[] = [
  { id: 'c1', name: 'Food & Dining', amount: 1240,    pct: 65, icon: 'restaurant-outline', iconColor: '#C2410C', iconBg: '#FFEDD5', barColor: '#F97316' },
  { id: 'c2', name: 'Groceries',     amount: 840.2,   pct: 42, icon: 'cart-outline',       iconColor: '#15803D', iconBg: '#DCFCE7', barColor: '#22C55E' },
  { id: 'c3', name: 'Transport',     amount: 320,     pct: 28, icon: 'car-outline',        iconColor: '#1D4ED8', iconBg: '#DBEAFE', barColor: '#3B82F6' },
];

function formatCad(value: number) {
  return `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InsightsScreen() {
  const remaining = BUDGET - TOTAL_SPENT;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={Colors.text} />
          </View>
          <Text style={styles.title}>Insights</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Period selector */}
        <View style={styles.periodRow}>
          <Text style={styles.periodLabel}>September 2023</Text>
          <View style={styles.periodActions}>
            <TouchableOpacity style={styles.periodChip}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textSub} />
              <Text style={styles.periodChipText}>Select Dates</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.periodChip}>
              <Text style={styles.periodChipText}>Yearly</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.textSub} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL SPENT</Text>
          <Text style={styles.heroAmount}>{formatCad(TOTAL_SPENT)}</Text>

          <View style={styles.heroBottom}>
            <View style={styles.ring}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke="#FFFFFF"
                  strokeWidth={RING_STROKE}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={RING_CIRC * (1 - USED_PCT)}
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                />
              </Svg>
              <View style={styles.ringLabel} pointerEvents="none">
                <Text style={styles.ringPct}>{Math.round(USED_PCT * 100)}%</Text>
              </View>
            </View>

            <View style={styles.budgetCol}>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Budget</Text>
                <Text style={styles.budgetValue}>{formatCad(BUDGET)}</Text>
              </View>
              <View style={styles.budgetTrack}>
                <View style={[styles.budgetFill, { width: `${USED_PCT * 100}%` }]} />
              </View>
              <Text style={styles.budgetCaption}>You have {formatCad(remaining)} remaining</Text>
            </View>
          </View>
        </View>

        {/* Smart Insights */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Smart Insights</Text>
          <Ionicons name="sparkles-outline" size={18} color={Colors.blue} />
        </View>

        <View style={styles.insightsList}>
          {INSIGHTS.map((ins) => (
            <View key={ins.id} style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: ins.bg }]}>
                <Ionicons name={ins.icon} size={20} color={ins.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightTitle}>{ins.title}</Text>
                <Text style={styles.insightBody}>{ins.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.viewDetails}>View Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryCard}>
          {CATEGORIES.map((cat, idx) => (
            <View
              key={cat.id}
              style={[styles.catRow, idx < CATEGORIES.length - 1 && styles.catRowDivider]}>
              <View style={[styles.catIcon, { backgroundColor: cat.iconBg }]}>
                <Ionicons name={cat.icon} size={20} color={cat.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.catTopRow}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catAmount}>{formatCad(cat.amount)}</Text>
                </View>
                <View style={styles.catBottomRow}>
                  <View style={styles.catTrack}>
                    <View
                      style={[styles.catFill, { width: `${cat.pct}%`, backgroundColor: cat.barColor }]}
                    />
                  </View>
                  <Text style={styles.catPct}>{cat.pct}%</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recurring banner */}
        <TouchableOpacity
          style={styles.recurringCard}
          activeOpacity={0.85}
          onPress={() => router.push('/subscriptions' as any)}>
          <View style={styles.recurringLeft}>
            <View style={styles.recurringIcon}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.recurringTitle}>Recurring Bills</Text>
              <Text style={styles.recurringSub}>4 payments due this week</Text>
            </View>
          </View>
          <View style={styles.recurringBtn}>
            <Text style={styles.recurringBtnText}>Manage</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
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
  title: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Period
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodLabel: { fontSize: 18, fontWeight: '700', color: Colors.text },
  periodActions: { flexDirection: 'row', gap: 8 },
  periodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  periodChipText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },

  // Hero card
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroAmount: { color: '#FFFFFF', fontSize: 40, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  heroBottom: { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 24 },
  ring: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  ringLabel: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ringPct: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  budgetCol: { flex: 1, gap: 8 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  budgetValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  budgetTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  budgetFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 999 },
  budgetCaption: { color: '#B3C5FF', fontSize: 12, fontWeight: '600' },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  viewDetails: { color: Colors.blue, fontSize: 12, fontWeight: '600' },

  // Insights
  insightsList: { gap: 12 },
  insightCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  insightBody: { color: Colors.textSub, fontSize: 13, lineHeight: 18 },

  // Categories
  categoryCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  catRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catName: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  catAmount: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  catBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.cardAlt,
    borderRadius: 999,
    overflow: 'hidden',
  },
  catFill: { height: '100%', borderRadius: 999 },
  catPct: { color: Colors.textSub, fontSize: 12, fontWeight: '600', width: 32, textAlign: 'right' },

  // Recurring
  recurringCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(225,227,228,0.5)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  recurringLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recurringIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recurringTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  recurringSub: { color: Colors.textSub, fontSize: 12, marginTop: 2 },
  recurringBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  recurringBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

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
