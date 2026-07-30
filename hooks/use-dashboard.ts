import {
  fetchMe,
  fetchRecentTransactions,
  fetchSummary,
  fetchTrend,
  MeResponse,
  RecentTransaction,
  SummaryPeriod,
  SummaryResponse,
  TrendPoint,
} from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export function useDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('May');
  const [calVisible, setCalVisible] = useState(false);

  // Profile
  const [me, setMe] = useState<MeResponse | null>(null);

  // Summary
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Recent transactions
  const [recent, setRecent] = useState<RecentTransaction[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  // Trend (mini chart)
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  const loadSummary = useCallback(
    async (params: { period: SummaryPeriod; from?: string; to?: string }) => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const data = await fetchSummary(params);
        setSummary(data);
      } catch (err: any) {
        setSummaryError(err?.message ?? 'Failed to load summary');
      } finally {
        setSummaryLoading(false);
      }
    },
    [],
  );

  const loadRecent = useCallback(async () => {
    setRecentLoading(true);
    try {
      const data = await fetchRecentTransactions({ limit: 4 });
      setRecent(data.items ?? []);
    } catch (err) {
      console.warn('recent transactions failed', err);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  const loadTrend = useCallback(async () => {
    try {
      const data = await fetchTrend(6);
      setTrend(data.series ?? []);
    } catch (err) {
      console.warn('trend failed', err);
    }
  }, []);

  // Initial mount: fire all four in parallel. Default summary period = month.
  useEffect(() => {
    fetchMe().then(setMe).catch((err) => console.warn('me failed', err));
    loadSummary({ period: 'month' });
    loadRecent();
    loadTrend();
  }, [loadSummary, loadRecent, loadTrend]);

  return {
    selectedMonth,
    setSelectedMonth,
    calVisible,
    setCalVisible,

    me,

    summary,
    summaryLoading,
    summaryError,
    loadSummary,

    recent,
    recentLoading,
    loadRecent,

    trend,
    loadTrend,
  };
}
