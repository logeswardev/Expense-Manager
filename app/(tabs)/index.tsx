import ActivityCard from '@/components/activity-card';
import CalendarModal from '@/components/calendar-modal';
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

function todayIso() {
  // Local date (avoids UTC shifting the day).
  const d = new Date();
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
    selectedMonth,
    setSelectedMonth,
    calVisible,
    setCalVisible,
    me,
    summary,
    summaryLoading,
    loadSummary,
    recent,
    trend,
  } = useDashboard();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('This month');

  useEffect(() => {
    if (timeFilter === 'Today') {
      const t = todayIso();
      loadSummary({ period: 'range', from: t, to: t });
    } else if (timeFilter === 'This week') {
      loadSummary({ period: 'week' });
    } else if (timeFilter === 'This month') {
      loadSummary({ period: 'month' });
    }
  }, [timeFilter, loadSummary]);

  const usedPct = Math.min(1, Math.max(0, summary?.budget?.usedPct ?? 0));
  const trendDir = summary?.trend?.direction ?? 'flat';
  const trendPct = summary?.trend?.pct;
  const trendLabel = summary?.trend?.label ?? '';
  const trendSign = trendDir === 'up' ? '+' : trendDir === 'down' ? '-' : '';
  const trendIcon = trendDir === 'down' ? 'trending-down' : 'trending-up';

  const trendMax = trend.reduce((m, p) => Math.max(m, p.amount), 0) || 1;
  const trendBars = trend.slice(-5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CalendarModal
        visible={calVisible}
        selectedMonth={selectedMonth}
        onApply={(m) => { setSelectedMonth(m); setCalVisible(false); }}
        onClose={() => setCalVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top App Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={Colors.text} />
            </View>
            <View>
              <Text style={styles.greeting}>{me?.greeting ?? 'Welcome'}</Text>
              <Text style={styles.greetingSub}>Track your expenses easily</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Monthly Spend Hero Card */}
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
              <View style={styles.ringLabel} pointerEvents="none">
                <Text style={styles.ringPct}>{Math.round((summary?.budget?.usedPct ?? 0) * 100)}%</Text>
                <Text style={styles.ringCaption}>BUDGET</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mini Stats */}
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

        {/* Time filters */}
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
                  if (label === 'Calendar') setCalVisible(true);
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

        {/* Recent Activity */}
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

        {/* Smart Insights */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsText}>
            <Text style={styles.insightsTitle}>Smart Insights</Text>
            <Text style={styles.insightsBody}>
              Your spending on dining out is 15% higher than last month. Consider a meal plan to save up to $120.00.
            </Text>
            <TouchableOpacity style={styles.insightsBtn}>
              <Text style={styles.insightsBtnText}>Go to Insights</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.miniChart}>
            {(trendBars.length > 0
              ? trendBars.map((p, i) => ({
                  key: p.month,
                  height: `${Math.max(10, Math.round((p.amount / trendMax) * 100))}%` as `${number}%`,
                  opacity: i === trendBars.length - 1 ? 1 : 0.3 + i * 0.15,
                }))
              : [
                  { key: 'b1', height: '30%' as const, opacity: 0.2 },
                  { key: 'b2', height: '50%' as const, opacity: 0.4 },
                  { key: 'b3', height: '80%' as const, opacity: 0.6 },
                  { key: 'b4', height: '60%' as const, opacity: 1 },
                  { key: 'b5', height: '40%' as const, opacity: 0.4 },
                ]
            ).map((b) => (
              <View key={b.key} style={[styles.bar, { height: b.height, opacity: b.opacity }]} />
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

