import ActivityCard from '@/components/activity-card';
import CalendarModal from '@/components/calendar-modal';
import { RECENT_ACTIVITY, TIME_FILTERS, TimeFilter } from '@/constants/dashboard';
import { Colors } from '@/constants/theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { styles } from '@/styles/dashboard.styles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const RING_SIZE = 120;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;
const BUDGET_PCT = 0.75;

export default function DashboardScreen() {
  const { selectedMonth, setSelectedMonth, calVisible, setCalVisible } = useDashboard();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Today');

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
              <Text style={styles.greeting}>Good morning, Jon</Text>
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
            <Text style={styles.spendLabel}>TOTAL SPEND THIS MONTH</Text>
            <Text style={styles.spendAmount}>$133,156.85</Text>
          </View>

          <View style={styles.spendBottom}>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={12} color="#FFFFFF" />
              <Text style={styles.trendText}>+12.5% FROM LAST MONTH</Text>
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
                  strokeDashoffset={RING_CIRC * (1 - BUDGET_PCT)}
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                />
              </Svg>
              <View style={styles.ringLabel} pointerEvents="none">
                <Text style={styles.ringPct}>75%</Text>
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
              <Text style={styles.statValue}>$4,295.38</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statLabel}>TRANSACTIONS</Text>
              <Text style={styles.statValue}>24 Items</Text>
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

        {/* Recent Activity */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/activity' as any)}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          {RECENT_ACTIVITY.map((item, idx) => (
            <ActivityCard
              key={item.id}
              merchant={item.merchant}
              date={item.date}
              category={item.category}
              amount={item.amount}
              isLast={idx === RECENT_ACTIVITY.length - 1}
            />
          ))}
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
            <View style={[styles.bar, { height: '30%', opacity: 0.2 }]} />
            <View style={[styles.bar, { height: '50%', opacity: 0.4 }]} />
            <View style={[styles.bar, { height: '80%', opacity: 0.6 }]} />
            <View style={[styles.bar, { height: '60%', opacity: 1 }]} />
            <View style={[styles.bar, { height: '40%', opacity: 0.4 }]} />
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
