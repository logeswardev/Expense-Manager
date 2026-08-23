import { Colors } from '@/constants/theme';
import MonthYearPicker, { MonthSelection, monthRange } from '@/components/month-year-picker';
import { fetchRecurring, RecurringItem } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatCad(value: number) {
  return `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function dueLabel(days: number | null) {
  if (days == null) return 'No date set';
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  return `In ${days} day${days === 1 ? '' : 's'}`;
}

export default function RecurringScreen() {
  const params = useLocalSearchParams<{ year?: string; monthIdx?: string }>();
  const today = new Date();
  const initialYear = Number(params.year);
  const initialMonthIdx = Number(params.monthIdx);
  const [month, setMonth] = useState<MonthSelection>(
    monthRange(
      Number.isFinite(initialYear) ? initialYear : today.getFullYear(),
      Number.isFinite(initialMonthIdx) ? initialMonthIdx : today.getMonth(),
    ),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    fetchRecurring()
      .then((data) => { if (active) { setItems(data.items); } })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load recurring items.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const monthKey = `${month.year}-${String(month.monthIdx + 1).padStart(2, '0')}`;
  const filteredItems = useMemo(
    () =>
      items
        .filter((item) => item.date?.slice(0, 7) === monthKey)
        .sort((a, b) => (a.daysUntil ?? Infinity) - (b.daysUntil ?? Infinity)),
    [items, monthKey],
  );
  const monthlyTotal = useMemo(
    () => filteredItems.reduce((sum, item) => sum + item.amount, 0),
    [filteredItems],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MonthYearPicker
        visible={pickerOpen}
        year={month.year}
        monthIdx={month.monthIdx}
        onClose={() => setPickerOpen(false)}
        onSelect={(selection) => setMonth(selection)}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Recurring Expenses</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.monthChip} onPress={() => setPickerOpen(true)}>
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text style={styles.monthChipText}>{month.label}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.textSub} />
        </TouchableOpacity>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>RECURRING PAYMENTS</Text>
          <Text style={styles.totalAmount}>{formatCad(monthlyTotal)}</Text>
          <Text style={styles.totalMeta}>{filteredItems.length} recurring item{filteredItems.length === 1 ? '' : 's'} in {month.label}</Text>
        </View>

        {loading && <ActivityIndicator style={styles.loader} color={Colors.primary} />}
        {error && <Text style={styles.empty}>{error}</Text>}
        {!loading && !error && filteredItems.length === 0 && (
          <Text style={styles.empty}>
            No recurring items found for {month.label}.
          </Text>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <View style={styles.group}>
            <Text style={styles.groupTitle}>{month.label}</Text>
            <View style={styles.list}>
              {filteredItems.map((item, index) => {
                const overdue = item.daysUntil != null && item.daysUntil < 0;
                const soon = item.daysUntil != null && item.daysUntil >= 0 && item.daysUntil <= 7;
                return (
                  <View key={item.id} style={[styles.row, index < filteredItems.length - 1 && styles.rowDivider]}>
                    <View style={[styles.rowIcon, overdue && { backgroundColor: Colors.redLight }]}>
                      <Ionicons
                        name={overdue ? 'alert-circle-outline' : 'repeat-outline'}
                        size={20}
                        color={overdue ? Colors.red : Colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName}>{item.name}</Text>
                      <Text style={styles.rowSub}>
                        {item.category ? `${item.category} • ` : ''}{formatDate(item.date)} • {item.cycle}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.rowAmount}>{formatCad(item.amount)}</Text>
                      <Text
                        style={[
                          styles.rowDue,
                          overdue && { color: Colors.red },
                          soon && !overdue && { color: Colors.amber },
                        ]}
                      >
                        {dueLabel(item.daysUntil)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
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
  monthChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, marginBottom: 12 },
  monthChipText: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '600' },
  totalCard: { backgroundColor: Colors.amber, borderRadius: 24, padding: 24, marginBottom: 20 },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  totalAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginTop: 6 },
  totalMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 8 },
  loader: { marginTop: 24 },
  group: { marginBottom: 20 },
  groupTitle: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 8, paddingHorizontal: 4 },
  list: { backgroundColor: Colors.card, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.divider },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  rowName: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  rowSub: { color: Colors.textSub, fontSize: 12, marginTop: 2 },
  rowAmount: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  rowDue: { color: Colors.textSub, fontSize: 12, marginTop: 2, fontWeight: '600' },
  empty: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 32, paddingHorizontal: 12 },
});
