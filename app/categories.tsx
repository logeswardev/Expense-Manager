import CalendarModal, { DateRange } from '@/components/calendar-modal';
import { monthRange } from '@/components/month-year-picker';
import { Colors } from '@/constants/theme';
import { CategoryTotal, fetchCategoryTotals } from '@/services/api';
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

export default function CategoriesDetailScreen() {
  const params = useLocalSearchParams<{ from?: string; to?: string }>();
  const today = new Date();
  const initial = params.from && params.to
    ? { from: params.from, to: params.to, label: `${formatDate(params.from)} – ${formatDate(params.to)}` }
    : (() => { const month = monthRange(today.getFullYear(), today.getMonth()); return { from: month.from, to: month.to, label: month.label }; })();

  const [range, setRange] = useState<DateRange>(initial);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [totals, setTotals] = useState<CategoryTotal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    fetchCategoryTotals({ from: range.from, to: range.to })
      .then((data) => { if (active) { setTotals(data.totals); setTotal(data.total); } })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load categories.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [range.from, range.to]);

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
        <Text style={styles.title}>Categories</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.dateFilter} onPress={() => setCalendarOpen(true)}>
          <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
          <Text style={styles.dateFilterText} numberOfLines={1}>{range.label}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textSub} />
        </TouchableOpacity>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL SPENT</Text>
          <Text style={styles.totalAmount}>{formatCad(total)}</Text>
          <Text style={styles.totalMeta}>{totals.length} categor{totals.length === 1 ? 'y' : 'ies'}</Text>
        </View>

        {loading && <ActivityIndicator style={styles.loader} color={Colors.primary} />}
        {error && <Text style={styles.empty}>{error}</Text>}
        {!loading && !error && totals.length === 0 && <Text style={styles.empty}>No expenses in this range.</Text>}

        {!loading && !error && totals.length > 0 && (
          <View style={styles.card}>
            {totals.map((entry, index) => (
              <View key={entry.category} style={[styles.row, index < totals.length - 1 && styles.rowDivider]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowName}>{entry.category}</Text>
                    <Text style={styles.rowAmount}>{formatCad(entry.amount)}</Text>
                  </View>
                  <Text style={styles.rowMeta}>{entry.count} transaction{entry.count === 1 ? '' : 's'}</Text>
                  <View style={styles.trackRow}>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${Math.min(100, entry.pct)}%` }]} />
                    </View>
                    <Text style={styles.pct}>{entry.pct}%</Text>
                  </View>
                </View>
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
  totalCard: { backgroundColor: Colors.primary, borderRadius: 24, padding: 24, marginBottom: 20 },
  totalLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  totalAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginTop: 6 },
  totalMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 8 },
  loader: { marginTop: 24 },
  card: { backgroundColor: Colors.card, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { padding: 16 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.divider },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowName: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  rowAmount: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  rowMeta: { color: Colors.textSub, fontSize: 12, marginTop: 4 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  track: { flex: 1, height: 6, backgroundColor: Colors.cardAlt, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: Colors.primary },
  pct: { color: Colors.textSub, fontSize: 12, fontWeight: '600', width: 44, textAlign: 'right' },
  empty: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 32 },
});
