import ActivityCard from '@/components/activity-card';
import { TIME_FILTERS, TimeFilter } from '@/constants/dashboard';
import { Colors } from '@/constants/theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { styles } from '@/styles/dashboard.styles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const RING_SIZE = 120;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

function todayIso(date = new Date()) {
  // Local date (avoids UTC shifting the day).
  const d = date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatCad(value: number) {
  return `$${(value ?? 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardScreen() {
  const {
    summary,
    summaryLoading,
    loadSummary,
    recent,
    loadRecent,
  } = useDashboard();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('This month');

  useEffect(() => {
    if (timeFilter === 'Today') {
      const t = todayIso();
      loadSummary({ period: 'range', from: t, to: t });
      loadRecent({ limit: 20, from: t, to: t });
    } else if (timeFilter === 'This week') {
      loadSummary({ period: 'week' });
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      loadRecent({ limit: 20, from: todayIso(monday), to: todayIso() });
    } else if (timeFilter === 'This month') {
      loadSummary({ period: 'month' });
      const monthStart = new Date();
      monthStart.setDate(1);
      loadRecent({ limit: 20, from: todayIso(monthStart), to: todayIso() });
    }
  }, [timeFilter, loadSummary, loadRecent]);

  const usedPct = Math.min(1, Math.max(0, summary?.budget?.usedPct ?? 0));
  const trendDir = summary?.trend?.direction ?? 'flat';
  const trendPct = summary?.trend?.pct;
  const trendLabel = summary?.trend?.label ?? '';
  const trendSign = trendDir === 'up' ? '+' : trendDir === 'down' ? '-' : '';
  const trendIcon = trendDir === 'down' ? 'trending-down' : 'trending-up';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.spendCard}>
          <View>
            <Text style={styles.spendLabel}>TOTAL SPEND</Text>
            <Text style={styles.spendAmount}>
              {summaryLoading && !summary ? '—' : formatCad(summary?.totalSpend ?? 0)}
            </Text>
          </View>

          <View style={styles.spendBottom}>
            <View style={styles.trendBadge}>
              <Ionicons name={trendIcon} size={12} color="#FFFFFF" />
              <Text style={styles.trendText}>
                {trendPct == null
                  ? trendLabel || 'NO BASELINE'
                  : `${trendSign}${Math.abs(trendPct).toFixed(1)}% ${trendLabel}`}
              </Text>
            </View>

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
                  strokeDashoffset={RING_CIRC * (1 - usedPct)}
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                />
              </Svg>
              <View style={[styles.ringLabel, { pointerEvents: 'none' }]}>
                <Text style={styles.ringPct}>{Math.round((summary?.budget?.usedPct ?? 0) * 100)}%</Text>
                <Text style={styles.ringCaption}>BUDGET</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>DAILY AVERAGE</Text>
              <Text style={styles.statValue}>{formatCad(summary?.dailyAverage ?? 0)}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>TRANSACTIONS</Text>
              <Text style={styles.statValue}>{summary?.transactionCount ?? 0} Items</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}>
          {TIME_FILTERS.map((label) => {
            const active = timeFilter === label;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  setTimeFilter(label);
                }}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {summaryLoading && summary && (
          <View style={{ paddingVertical: 8, alignItems: 'center' }}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        )}

        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/activity' as any)}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          {recent.length === 0 ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ color: Colors.textMuted, fontSize: 13 }}>No recent activity</Text>
            </View>
          ) : (
            recent.map((item, idx) => {
              const signedAmount = item.type === 'expense' ? -Math.abs(item.amount) : Math.abs(item.amount);
              return (
                <ActivityCard
                  key={item.id}
                  merchant={item.merchant}
                  date={item.date}
                  category={item.category}
                  amount={signedAmount}
                  isLast={idx === recent.length - 1}
                />
              );
            })
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
