import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const RING_SIZE = 128;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

const TOTAL_SPENT = 4280.5;
const BUDGET = 5000;
const USED_PCT = TOTAL_SPENT / BUDGET;

const CATEGORIES = [
  { id: 'c1', name: 'Food & Dining', amount: 1240, pct: 65 },
  { id: 'c2', name: 'Groceries', amount: 840.2, pct: 42 },
  { id: 'c3', name: 'Transport', amount: 320, pct: 28 },
];

function formatCad(value: number) {
  return `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InsightsScreen() {
  const remaining = BUDGET - TOTAL_SPENT;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.periodRow}>
          <Text style={styles.periodLabel}>September 2023</Text>
          <TouchableOpacity style={styles.periodChip}>
            <Text style={styles.periodChipText}>Yearly</Text>
          </TouchableOpacity>
        </View>

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
              <View style={[styles.ringLabel, { pointerEvents: 'none' }]}>
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
              <View style={{ flex: 1 }}>
                <View style={styles.catTopRow}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catAmount}>{formatCad(cat.amount)}</Text>
                </View>
                <View style={styles.catBottomRow}>
                  <View style={styles.catTrack}>
                    <View style={[styles.catFill, { width: `${cat.pct}%` }]} />
                  </View>
                  <Text style={styles.catPct}>{cat.pct}%</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.recurringCard}
          activeOpacity={0.85}
          onPress={() => router.push('/subscriptions' as any)}>
          <View style={styles.recurringLeft}>
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
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodLabel: { fontSize: 18, fontWeight: '700', color: Colors.text },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  periodChipText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  viewDetails: { color: Colors.blue, fontSize: 12, fontWeight: '600' },
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
    padding: 16,
  },
  catRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
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
  catFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.primary },
  catPct: { color: Colors.textSub, fontSize: 12, fontWeight: '600', width: 32, textAlign: 'right' },
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
  recurringTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  recurringSub: { color: Colors.textSub, fontSize: 12, marginTop: 2 },
  recurringBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  recurringBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});
