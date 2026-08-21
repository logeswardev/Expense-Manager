import CalendarModal, { DateRange } from '@/components/calendar-modal';
import { Colors } from '@/constants/theme';
import { fetchTransactions, RecentTransaction } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
const PAGE_SIZE = 15;
const FILTERS = [
  'All',
  'Grocery',
  'Transport',
  'Outside food',
  'Couple Outing',
  'Loki Personal',
  'Devika Personal',
  'Recurring expenses',
  'Parents',
  'Pending to review',
  'Unknown',
] as const;
type Filter = (typeof FILTERS)[number];
const CATEGORY_ICONS: Record<string, IoniconsName> = {
  Grocery: 'basket-outline',
  Transport: 'car-outline',
  'Outside food': 'restaurant-outline',
  'Couple Outing': 'heart-outline',
  'Loki Personal': 'person-outline',
  'Devika Personal': 'flower-outline',
  'Recurring expenses': 'repeat-outline',
  Parents: 'home-outline',
  'Pending to review': 'help-circle-outline',
  Unknown: 'pricetag-outline',
  Income: 'wallet-outline',
};

function localIso(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function groupLabel(date: string) {
  const today = localIso();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (date === today) return 'Today';
  if (date === localIso(yesterday)) return 'Yesterday';
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatAmount(item: RecentTransaction) {
  const income = item.type === 'income';
  return `${income ? '+' : '-'}$${Math.abs(item.amount).toFixed(2)}`;
}

export default function ActivityScreen() {
  const params = useLocalSearchParams<{ from?: string; to?: string }>();
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [range, setRange] = useState<DateRange | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.from && params.to) {
      setRange({ from: params.from, to: params.to, label: `${params.from} – ${params.to}` });
    }
  }, [params.from, params.to]);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    fetchTransactions(range ? { from: range.from, to: range.to } : {})
      .then((items) => { if (active) setTransactions(items); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load transactions.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [range]);

  const filtered = useMemo(
    () =>
      transactions.filter(
        (item) =>
          item.merchant.toLowerCase().includes(search.toLowerCase()) &&
          (filter === 'All' || (item.category || 'Unknown') === filter),
      ),
    [transactions, search, filter],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalSpend = filtered.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => { setPage(1); }, [search, filter, range]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {calendarOpen && <CalendarModal visible selectedMonth={new Date().toLocaleString('en-US', { month: 'long' })} onClose={() => setCalendarOpen(false)} onApply={(value) => { setRange(value); setCalendarOpen(false); }} />}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.searchBar}><Ionicons name="search" size={18} color={Colors.textSub} /><TextInput style={styles.searchInput} placeholder="Search transactions..." placeholderTextColor={Colors.textSub} value={search} onChangeText={setSearch} /></View>
        <TouchableOpacity style={styles.dateFilter} onPress={() => setCalendarOpen(true)}><Ionicons name="calendar-outline" size={18} color={Colors.primary} /><Text style={styles.dateFilterText}>{range?.label ?? 'All dates'}</Text><Ionicons name="chevron-down" size={16} color={Colors.textSub} /></TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipList}>{FILTERS.map((value) => <TouchableOpacity key={value} style={[styles.chip, filter === value && styles.chipActive]} onPress={() => setFilter(value)}><Text style={[styles.chipText, filter === value && styles.chipTextActive]}>{value}</Text></TouchableOpacity>)}</ScrollView>
        <View style={styles.totalCard}><Text style={styles.totalLabel}>{range?.label ?? 'TOTAL SPENDING'}</Text><Text style={styles.totalAmount}>${totalSpend.toFixed(2)}</Text><Text style={styles.trendText}>{filtered.length} transaction{filtered.length === 1 ? '' : 's'} found</Text></View>
        {loading && <ActivityIndicator style={styles.loader} color={Colors.primary} />}
        {error && <Text style={styles.empty}>{error}</Text>}
        {!loading && !error && pageItems.map((item, index) => { const income = item.type === 'income'; const category = item.category || 'Unknown'; const icon = CATEGORY_ICONS[category] ?? 'pricetag-outline'; return <View key={item.id} style={styles.groupSection}>{(index === 0 || groupLabel(pageItems[index - 1].date) !== groupLabel(item.date)) && <Text style={styles.groupTitle}>{groupLabel(item.date)}</Text>}<View style={styles.groupCard}><View style={styles.row}><View style={[styles.rowIcon, income && { backgroundColor: Colors.incomeBg }]}><Ionicons name={icon} size={20} color={income ? Colors.income : Colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.rowMerchant}>{item.merchant}</Text><Text style={styles.rowSub}>{category} • {item.date}</Text></View><Text style={[styles.rowAmount, { color: income ? Colors.income : Colors.red }]}>{formatAmount(item)}</Text></View></View></View>; })}
        {!loading && !error && filtered.length === 0 && <Text style={styles.empty}>No transactions found.</Text>}
        {filtered.length > PAGE_SIZE && <View style={styles.pagination}><TouchableOpacity disabled={currentPage === 1} onPress={() => setPage((value) => value - 1)} style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}><Ionicons name="chevron-back" size={18} color={Colors.text} /></TouchableOpacity><Text style={styles.pageText}>Page {currentPage} of {pageCount}</Text><TouchableOpacity disabled={currentPage === pageCount} onPress={() => setPage((value) => value + 1)} style={[styles.pageButton, currentPage === pageCount && styles.pageButtonDisabled]}><Ionicons name="chevron-forward" size={18} color={Colors.text} /></TouchableOpacity></View>}
        <View style={{ height: 100 }} />
      </ScrollView>
      <Pressable style={styles.fab} onPress={() => router.push('/import-statement' as any)}><Ionicons name="cloud-upload-outline" size={26} color="#FFFFFF" /></Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg }, scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }, searchBar: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.cardDark, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12 }, searchInput: { flex: 1, color: Colors.text, fontSize: 15, padding: 0 }, dateFilter: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, marginBottom: 12 }, dateFilterText: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '600' }, chipList: { gap: 8, paddingRight: 4, paddingBottom: 4 }, chip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.cardAlt }, chipActive: { backgroundColor: Colors.primary }, chipText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' }, chipTextActive: { color: '#FFFFFF' }, totalCard: { backgroundColor: Colors.primary, borderRadius: 24, padding: 24, marginTop: 16 }, totalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 }, totalAmount: { color: '#FFFFFF', fontSize: 40, fontWeight: '800' }, trendText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 12 }, loader: { marginTop: 32 }, groupSection: { marginTop: 16 }, groupTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 8, paddingHorizontal: 4 }, groupCard: { backgroundColor: Colors.card, borderRadius: 18, borderWidth: 1, borderColor: Colors.border }, row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }, rowIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center', marginRight: 14 }, rowMerchant: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 2 }, rowSub: { color: Colors.textSub, fontSize: 13 }, rowAmount: { fontSize: 16, fontWeight: '700' }, empty: { color: Colors.textSub, textAlign: 'center', marginTop: 32, fontSize: 14 }, pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 24 }, pageButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' }, pageButtonDisabled: { opacity: 0.35 }, pageText: { color: Colors.textSub, fontSize: 13, fontWeight: '600' }, fab: { position: 'absolute', right: 20, bottom: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
});
