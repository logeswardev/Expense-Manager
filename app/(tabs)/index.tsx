import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '@/constants/theme';

const recentActivity = [
  { id: '1', merchant: 'The Green Bistro', date: 'Today, 8:42 PM', category: 'dining', amount: -84.2 },
  { id: '2', merchant: 'Whole Foods Market', date: 'Yesterday, 11:15 AM', category: 'groceries', amount: -156.3 },
  { id: '3', merchant: 'Delta Airlines', date: 'May 3, 2:30 PM', category: 'travel', amount: -420.0 },
];

const MONTHS_ROW = ['March', 'April', 'May', 'June', 'July'];
const MONTHS_GRID = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const SEGMENTS = [
  { pct: 0.35, color: '#7C6FF7' },
  { pct: 0.25, color: '#22D3EE' },
  { pct: 0.28, color: '#F87171' },
  { pct: 0.12, color: '#4B5563' },
];

const LEGEND = [
  { label: 'Groceries', color: '#7C6FF7' },
  { label: 'Dining Out', color: '#22D3EE' },
  { label: 'Travel', color: '#F87171' },
  { label: 'Other', color: '#4B5563' },
];

function DonutChart() {
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 6;
  let offset = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          <Circle cx={cx} cy={cy} r={radius} stroke="#1A2540" strokeWidth={strokeWidth} fill="none" />
          {SEGMENTS.map((seg, i) => {
            const dash = circumference * seg.pct - gap;
            const currentOffset = -offset * circumference - (i * gap) / 2;
            offset += seg.pct;
            return (
              <Circle
                key={i}
                cx={cx} cy={cy} r={radius}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={currentOffset}
                strokeLinecap="round"
              />
            );
          })}
        </G>
      </Svg>
      <View style={styles.donutCenter} pointerEvents="none">
        <Text style={styles.donutLabel}>Used</Text>
        <Text style={styles.donutPct}>82%</Text>
      </View>
    </View>
  );
}

function catIcon(cat: string): React.ComponentProps<typeof Ionicons>['name'] {
  switch (cat) {
    case 'dining': return 'restaurant-outline';
    case 'groceries': return 'cart-outline';
    case 'travel': return 'airplane-outline';
    default: return 'car-outline';
  }
}

function catBg(cat: string): string {
  switch (cat) {
    case 'dining': return '#1E3A3A';
    case 'groceries': return '#1A2540';
    case 'travel': return '#2A1F3A';
    default: return Colors.cardAlt;
  }
}

function catIconColor(cat: string): string {
  switch (cat) {
    case 'dining': return '#22D3EE';
    case 'groceries': return '#7C6FF7';
    case 'travel': return '#F87171';
    default: return Colors.textSub;
  }
}

function CalendarModal({
  visible,
  selectedMonth,
  onApply,
  onClose,
}: {
  visible: boolean;
  selectedMonth: string;
  onApply: (month: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'month' | 'range'>('month');
  const [year, setYear] = useState(2024);
  const shortIdx = MONTHS_FULL.findIndex(m => m === selectedMonth);
  const [picked, setPicked] = useState(shortIdx >= 0 ? MONTHS_GRID[shortIdx] : 'May');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Tab toggle */}
          <View style={styles.modalTabs}>
            <TouchableOpacity
              style={[styles.modalTab, tab === 'month' && styles.modalTabActive]}
              onPress={() => setTab('month')}>
              <Text style={[styles.modalTabText, tab === 'month' && styles.modalTabTextActive]}>Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalTab, tab === 'range' && styles.modalTabActive]}
              onPress={() => setTab('range')}>
              <Text style={[styles.modalTabText, tab === 'range' && styles.modalTabTextActive]}>Date Range</Text>
            </TouchableOpacity>
          </View>

          {/* Year navigator */}
          <View style={styles.yearRow}>
            <TouchableOpacity onPress={() => setYear(y => y - 1)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="chevron-back" size={22} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.yearText}>{year}</Text>
            <TouchableOpacity onPress={() => setYear(y => y + 1)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="chevron-forward" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Month grid */}
          <View style={styles.monthGrid}>
            {MONTHS_GRID.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.gridCell, picked === m && styles.gridCellActive]}
                onPress={() => setPicked(m)}>
                <Text style={[styles.gridCellText, picked === m && styles.gridCellTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                const idx = MONTHS_GRID.findIndex(m => m === picked);
                onApply(idx >= 0 ? MONTHS_FULL[idx] : picked);
              }}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function DashboardScreen() {
  const [selectedMonth, setSelectedMonth] = useState('May');
  const [calVisible, setCalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CalendarModal
        visible={calVisible}
        selectedMonth={selectedMonth}
        onApply={(m) => { setSelectedMonth(m); setCalVisible(false); }}
        onClose={() => setCalVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <Ionicons name="wallet-outline" size={18} color={Colors.green} />
            </View>
            <Text style={styles.logoText}>Expense Tracker</Text>
          </View>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={Colors.text} />
          </View>
        </View>

        {/* Month chips + calendar button */}
        <View style={styles.chipRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipList}>
            {MONTHS_ROW.map((month) => (
              <TouchableOpacity
                key={month}
                style={[styles.monthChip, selectedMonth === month && styles.monthChipActive]}
                onPress={() => setSelectedMonth(month)}>
                <Text style={[styles.monthChipText, selectedMonth === month && styles.monthChipTextActive]}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.calBtn} onPress={() => setCalVisible(true)}>
            <Ionicons name="calendar-outline" size={20} color={Colors.textSub} />
          </TouchableOpacity>
        </View>

        {/* Monthly Spend Card */}
        <View style={styles.spendCard}>
          <View style={styles.spendCardTop}>
            <View>
              <Text style={styles.spendCardLabel}>MONTHLY SPEND</Text>
              <Text style={styles.spendCardAmount}>$4,280.50</Text>
            </View>
            <View style={styles.chartIconBtn}>
              <Ionicons name="analytics-outline" size={20} color={Colors.textSub} />
            </View>
          </View>
          <View style={styles.chartArea}>
            <DonutChart />
          </View>
          <View style={styles.legendGrid}>
            {LEGEND.map((l) => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/activity' as any)}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentActivity.map((item) => (
          <View key={item.id} style={styles.activityCard}>
            <View style={[styles.activityIconBox, { backgroundColor: catBg(item.category) }]}>
              <Ionicons name={catIcon(item.category)} size={22} color={catIconColor(item.category)} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityMerchant}>{item.merchant}</Text>
              <Text style={styles.activityDate}>{item.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.activityAmount}>-${Math.abs(item.amount).toFixed(2)}</Text>
              <Text style={[styles.activityCatLabel, { color: catIconColor(item.category) }]}>
                {item.category.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 90 }} />
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
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 36, height: 36, borderRadius: 9, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20, fontWeight: '700', color: Colors.text },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },

  chipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 8 },
  chipList: { gap: 8, paddingRight: 4 },
  monthChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  monthChipActive: { backgroundColor: '#2C2860', borderColor: '#7C6FF7' },
  monthChipText: { color: Colors.textSub, fontSize: 15, fontWeight: '600' },
  monthChipTextActive: { color: '#A5B4FC', fontWeight: '700' },
  calBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },

  spendCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: Colors.border },
  spendCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  spendCardLabel: { color: Colors.textSub, fontSize: 11, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 6 },
  spendCardAmount: { color: Colors.text, fontSize: 32, fontWeight: '800' },
  chartIconBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },

  chartArea: { alignItems: 'center', marginVertical: 8 },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutLabel: { fontSize: 13, color: Colors.textSub, marginBottom: 2 },
  donutPct: { fontSize: 26, fontWeight: '800', color: Colors.text },

  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, rowGap: 10, columnGap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '47%' },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: Colors.textSub, fontSize: 14 },

  sectionTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  seeAll: { fontSize: 15, color: Colors.green, fontWeight: '600' },

  activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10 },
  activityIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  activityInfo: { flex: 1 },
  activityMerchant: { color: Colors.text, fontSize: 16, fontWeight: '600', marginBottom: 3 },
  activityDate: { color: Colors.textMuted, fontSize: 12 },
  activityAmount: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  activityCatLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },

  fab: { position: 'absolute', right: 20, bottom: 28, width: 56, height: 56, borderRadius: 18, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.green, shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#0F1826', borderRadius: 22, padding: 22, width: '100%', borderWidth: 1, borderColor: Colors.border },
  modalTabs: { flexDirection: 'row', backgroundColor: Colors.cardAlt, borderRadius: 12, padding: 4, marginBottom: 20 },
  modalTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modalTabActive: { backgroundColor: Colors.card },
  modalTabText: { color: Colors.textSub, fontSize: 14, fontWeight: '600' },
  modalTabTextActive: { color: Colors.text },
  yearRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingHorizontal: 8 },
  yearText: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, columnGap: 8, marginBottom: 24 },
  gridCell: { width: '30%', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  gridCellActive: { backgroundColor: '#7C6FF7' },
  gridCellText: { color: Colors.textSub, fontSize: 15, fontWeight: '600' },
  gridCellTextActive: { color: '#fff', fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelText: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  applyBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#7C6FF7', alignItems: 'center' },
  applyText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
