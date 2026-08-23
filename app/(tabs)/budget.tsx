import CalendarModal, { DateRange } from '@/components/calendar-modal';
import InsightCard from '@/components/insight-card';
import MonthYearPicker, { monthRange, MonthSelection } from '@/components/month-year-picker';
import { Colors } from '@/constants/theme';
import { fetchCategoryTotals, fetchRecurring, fetchSummary, type CategoryTotal } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatCad(value: number) {
  return `$${(value ?? 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const CATEGORY_PREVIEW = 3;

export default function InsightsScreen() {
  const today = new Date();
  const [month, setMonth] = useState<MonthSelection>(monthRange(today.getFullYear(), today.getMonth()));
  const [range, setRange] = useState<DateRange>({ from: month.from, to: month.to, label: month.label });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [summary, setSummary] = useState<{ totalSpend: number; totalIncome: number; count: number } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<{ totals: CategoryTotal[]; total: number } | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [recurring, setRecurring] = useState<{ count: number; monthlyTotal: number; nextLabel: string | null } | null>(null);
  const [recurringLoading, setRecurringLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setSummaryLoading(true);
    setCategoryLoading(true);
    setError(null);

    Promise.all([
      fetchSummary({ period: 'range', from: range.from, to: range.to }),
      fetchCategoryTotals({ from: range.from, to: range.to }),
    ])
      .then(([summaryResponse, categoryResponse]) => {
        if (!active) return;
        setSummary({
          totalSpend: summaryResponse.totalSpend,
          totalIncome: summaryResponse.totalIncome,
          count: summaryResponse.transactionCount,
        });
        setCategoryData(categoryResponse);
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load insights.'); })
      .finally(() => { if (active) { setSummaryLoading(false); setCategoryLoading(false); } });

    return () => { active = false; };
  }, [range.from, range.to]);

  useEffect(() => {
    let active = true;
    setRecurringLoading(true);
    fetchRecurring()
      .then((data) => {
        if (!active) return;
        const monthKey = `${month.year}-${String(month.monthIdx + 1).padStart(2, '0')}`;
        const monthItems = data.items.filter((item) => item.date?.slice(0, 7) === monthKey);
        const next = monthItems.find((item) => item.daysUntil != null && item.daysUntil >= 0);
        const monthlyTotal = monthItems.reduce((sum, item) => sum + item.amount, 0);
        setRecurring({
          count: monthItems.length,
          monthlyTotal,
          nextLabel: next ? `${next.name} in ${next.daysUntil} day${next.daysUntil === 1 ? '' : 's'}` : null,
        });
      })
      .catch(() => { if (active) setRecurring({ count: 0, monthlyTotal: 0, nextLabel: null }); })
      .finally(() => { if (active) setRecurringLoading(false); });
    return () => { active = false; };
  }, [month.monthIdx, month.year]);

  function applyMonth(selection: MonthSelection) {
    setMonth(selection);
    setRange({ from: selection.from, to: selection.to, label: selection.label });
  }

  function applyRange(next: DateRange) {
    setRange(next);
    setCalendarOpen(false);
  }

  const categoryPreview = useMemo(() => categoryData?.totals.slice(0, CATEGORY_PREVIEW) ?? [], [categoryData]);
  const spendSubtitle = summary ? `${summary.count} transaction${summary.count === 1 ? '' : 's'}` : ' ';
  const incomeSubtitle = summary && summary.totalIncome > 0 ? 'Tap to review income' : 'No income recorded';
  const recurringSubtitle = recurring
    ? recurring.count === 0
      ? 'No recurring items'
      : recurring.nextLabel ?? `${recurring.count} bill${recurring.count === 1 ? '' : 's'} in ${month.label}`
    : ' ';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {calendarOpen && (
        <CalendarModal
          visible
          selectedMonth={new Date().toLocaleString('en-US', { month: 'long' })}
          onClose={() => setCalendarOpen(false)}
          onApply={applyRange}
        />
      )}
      <MonthYearPicker
        visible={pickerOpen}
        year={month.year}
        monthIdx={month.monthIdx}
        onClose={() => setPickerOpen(false)}
        onSelect={applyMonth}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Review your spending, income, and recurring bills.</Text>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterChip} onPress={() => setCalendarOpen(true)}>
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={styles.filterChipText} numberOfLines={1}>{range.label}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textSub} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip} onPress={() => setPickerOpen(true)}>
            <Ionicons name="chevron-collapse-outline" size={16} color={Colors.primary} />
            <Text style={styles.filterChipText} numberOfLines={1}>{month.label}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textSub} />
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <InsightCard
          label="TOTAL SPENT"
          icon="trending-down-outline"
          amount={summary?.totalSpend ?? 0}
          subtitle={spendSubtitle}
          loading={summaryLoading}
          onPress={() => router.push({ pathname: '/(tabs)/activity' as any, params: { from: range.from, to: range.to } })}
        />

        <InsightCard
          label="TOTAL INCOME"
          icon="trending-up-outline"
          variant="income"
          amount={summary?.totalIncome ?? 0}
          subtitle={incomeSubtitle}
          loading={summaryLoading}
          onPress={() => router.push({ pathname: '/income' as any, params: { from: range.from, to: range.to } })}
        />

        <InsightCard
          label="RECURRING EXPENSES"
          icon="repeat-outline"
          variant="recurring"
          amount={recurring?.monthlyTotal ?? 0}
          subtitle={recurringSubtitle}
          loading={recurringLoading}
          onPress={() =>
            router.push({
              pathname: '/recurring' as any,
              params: { year: String(month.year), monthIdx: String(month.monthIdx) },
            })
          }
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/categories' as any, params: { from: range.from, to: range.to } })}
          >
            <Text style={styles.viewDetails}>View details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryCard}>
          {categoryLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ margin: 20 }} />
          ) : categoryPreview.length === 0 ? (
            <Text style={styles.empty}>No expenses in this range.</Text>
          ) : (
            categoryPreview.map((entry, index) => (
              <View
                key={entry.category}
                style={[styles.catRow, index < categoryPreview.length - 1 && styles.catRowDivider]}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.catTopRow}>
                    <Text style={styles.catName}>{entry.category}</Text>
                    <Text style={styles.catAmount}>{formatCad(entry.amount)}</Text>
                  </View>
                  <View style={styles.catBottomRow}>
                    <View style={styles.catTrack}>
                      <View style={[styles.catFill, { width: `${Math.min(100, entry.pct)}%` }]} />
                    </View>
                    <Text style={styles.catPct}>{entry.pct}%</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSub, marginTop: 4, marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  filterChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Colors.card, borderColor: Colors.border, borderWidth: 1, borderRadius: 12 },
  filterChipText: { flex: 1, color: Colors.text, fontSize: 13, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  viewDetails: { color: Colors.blue, fontSize: 13, fontWeight: '600' },
  categoryCard: { backgroundColor: Colors.card, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  catRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  catRowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.divider },
  catTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catName: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  catAmount: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  catBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catTrack: { flex: 1, height: 6, backgroundColor: Colors.cardAlt, borderRadius: 999, overflow: 'hidden' },
  catFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.primary },
  catPct: { color: Colors.textSub, fontSize: 12, fontWeight: '600', width: 44, textAlign: 'right' },
  empty: { padding: 20, color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
  error: { color: Colors.red, fontSize: 13, marginBottom: 12 },
});
