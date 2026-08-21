import { Colors } from '@/constants/theme';
import { fetchTransactions, RecentTransaction } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AccountSummary = {
  name: string;
  income: number;
  expense: number;
  net: number;
  count: number;
  recent: RecentTransaction[];
};

function formatCad(value: number) {
  return `$${Math.abs(value).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AccountCard({ item }: { item: AccountSummary }) {
  const netPositive = item.net >= 0;

  return (
    <View style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <View>
          <Text style={styles.accountName}>{item.name}</Text>
          <Text style={styles.accountMeta}>{item.count} transaction{item.count === 1 ? '' : 's'}</Text>
        </View>
        <View style={styles.accountBadge}>
          <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
          <Text style={styles.accountBadgeText}>Tracked</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Money In</Text>
          <Text style={[styles.metricValue, { color: Colors.income }]}>+{formatCad(item.income)}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Money Out</Text>
          <Text style={[styles.metricValue, { color: Colors.red }]}>-{formatCad(item.expense)}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Net Change</Text>
          <Text style={[styles.metricValue, { color: netPositive ? Colors.income : Colors.red }]}>
            {netPositive ? '+' : '-'}
            {formatCad(item.net)}
          </Text>
        </View>
      </View>

      <View style={styles.transactionSection}>
        <Text style={styles.transactionSectionTitle}>Recent account activity</Text>
        {item.recent.map((transaction, index) => {
          const income = transaction.type === 'income';
          return (
            <View
              key={transaction.id}
              style={[styles.transactionRow, index < item.recent.length - 1 && styles.transactionDivider]}>
              <View style={[styles.transactionIcon, income && { backgroundColor: Colors.incomeBg }]}>
                <Ionicons
                  name={income ? 'arrow-down-outline' : 'arrow-up-outline'}
                  size={16}
                  color={income ? Colors.income : Colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.transactionName}>{transaction.merchant}</Text>
                <Text style={styles.transactionMeta}>
                  {transaction.category || 'Unknown'} • {transaction.date}
                </Text>
              </View>
              <Text style={[styles.transactionAmount, { color: income ? Colors.income : Colors.red }]}>
                {income ? '+' : '-'}
                {formatCad(transaction.amount)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function AccountsScreen() {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchTransactions()
      .then((items) => {
        if (active) setTransactions(items);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load account activity.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const accounts = useMemo(() => {
    const groups = new Map<string, AccountSummary>();

    for (const transaction of transactions) {
      const key = transaction.account || 'Default Account';
      const group = groups.get(key) ?? {
        name: key,
        income: 0,
        expense: 0,
        net: 0,
        count: 0,
        recent: [],
      };

      if (transaction.type === 'income') {
        group.income += transaction.amount;
        group.net += transaction.amount;
      } else {
        group.expense += transaction.amount;
        group.net -= transaction.amount;
      }

      group.count += 1;
      if (group.recent.length < 6) {
        group.recent.push(transaction);
      }

      groups.set(key, group);
    }

    return Array.from(groups.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [transactions]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Accounts</Text>
          <Text style={styles.subtitle}>Track account-wise transaction flow from your Notion data.</Text>
        </View>

        {loading && <ActivityIndicator style={styles.loader} color={Colors.primary} />}
        {error && <Text style={styles.empty}>{error}</Text>}

        {!loading && !error && accounts.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No account activity yet</Text>
            <Text style={styles.emptyBody}>Transactions will appear here once your Notion records include account-linked entries.</Text>
          </View>
        )}

        {!loading && !error && accounts.map((account) => <AccountCard key={account.name} item={account} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  subtitle: { color: Colors.textSub, fontSize: 14, lineHeight: 20 },
  loader: { marginTop: 40 },
  empty: { color: Colors.textSub, textAlign: 'center', marginTop: 32, fontSize: 14 },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  emptyTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptyBody: { color: Colors.textSub, fontSize: 14, lineHeight: 20 },
  accountCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18,
  },
  accountName: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  accountMeta: { color: Colors.textSub, fontSize: 13, marginTop: 4 },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cardAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  accountBadgeText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  metricBox: {
    flex: 1,
    backgroundColor: Colors.cardDark,
    borderRadius: 16,
    padding: 12,
  },
  metricLabel: { color: Colors.textSub, fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 0.4 },
  metricValue: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  transactionSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  transactionSectionTitle: { color: Colors.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  transactionDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionName: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  transactionMeta: { color: Colors.textSub, fontSize: 12 },
  transactionAmount: { fontSize: 15, fontWeight: '800' },
});
