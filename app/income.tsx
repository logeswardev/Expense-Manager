import CalendarModal, { DateRange } from '@/components/calendar-modal';
import { monthRange } from '@/components/month-year-picker';
import { Colors } from '@/constants/theme';
import { fetchTransactions, RecentTransaction } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatCad(value: number) {
  return `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function IncomeScreen() {
  const params = useLocalSearchParams<{ from?: string; to?: string }>();
  const today = new Date();
  const initial = params.from && params.to
    ? { from: params.from, to: params.to, label: `${formatDate(params.from)} – ${formatDate(params.to)}` }
    : (() => { const month = monthRange(today.getFullYear(), today.getMonth()); return { from: month.from, to: month.to, label: month.label }; })();

  const [range, setRange] = useState<DateRange>(initial);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [items, setItems] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    fetchTransactions({ from: range.from, to: range.to })
      .then((data) => { if (active) setItems(data.filter((item) => item.type === 'income')); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load income.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [range.from, range.to]);

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {calendarOpen && (
        <CalendarModal
          visible
          selectedMonth={new Date().toLocaleString('en-US', { month: 'long' })}
          onClose={() => setCalendarOpen(false)}
          onApply={(next) => { setRange(next); setCalendarOpen(false); }}
        />
      )}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Income</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.dateFilter} onPress={() => setCalendarOpen(true)}>
          <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
          <Text style={styles.dateFilterText} numberOfLines={1}>{range.label}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textSub} />
        </TouchableOpacity>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL INCOME</Text>
          <Text style={styles.totalAmount}>{formatCad(total)}</Text>
          <Text style={styles.totalMeta}>{items.length} transaction{items.length === 1 ? '' : 's'}</Text>
        </View>

        {loading && <ActivityIndicator style={styles.loader} color={Colors.primary} />}
        {error && <Text style={styles.empty}>{error}</Text>}
        {!loading && !error && items.length === 0 && <Text style={styles.empty}>No income in this range.</Text>}

        {!loading && !error && items.length > 0 && (
          <View style={styles.list}>
            {items.map((item, index) => (
              <View key={item.id} style={[styles.row, index < items.length - 1 && styles.rowDivider]}>
                <View style={styles.rowIcon}>
                  <Ionicons name="arrow-down-outline" size={20} color={Colors.income} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{item.merchant}</Text>
                  <Text style={styles.rowSub}>{item.category} • {formatDate(item.date)}</Text>
                </View>
                <Text style={styles.rowAmount}>+{formatCad(item.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: Colors.text },
  scroll: { paddingHorizontal: 20 },
  dateFilter: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, marginBottom: 12 },
  dateFilterText: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '600' },
  totalCard: { backgroundColor: Colors.income, borderRadius: 24, padding: 24, marginBottom: 20 },
  totalLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  totalAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginTop: 6 },
  totalMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 8 },
  loader: { marginTop: 24 },
  list: { backgroundColor: Colors.card, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.divider },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.incomeBg, alignItems: 'center', justifyContent: 'center' },
  rowName: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  rowSub: { color: Colors.textSub, fontSize: 12, marginTop: 2 },
  rowAmount: { color: Colors.income, fontSize: 15, fontWeight: '800' },
  empty: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 32 },
});
