/**
 * Client-side data facade.
 *
 * Browser reads and writes use the Vercel serverless endpoint. The endpoint
 * keeps the Notion token private and avoids the browser CORS limitation.
 */
import {
  createNotionTransaction,
  fetchNotionTransactions,
  type NotionTransaction,
} from '@/services/notion-api';

export type SummaryPeriod = 'today' | 'week' | 'month' | 'range';

export interface MeResponse {
  name: string;
  greeting: string;
  avatarUrl: string | null;
  currency: string;
}

export interface SummaryResponse {
  period: { from: string; to: string; label?: string };
  totalSpend: number;
  totalIncome: number;
  transactionCount: number;
  dailyAverage: number;
  trend: { direction: 'up' | 'down' | 'flat'; pct: number | null; label: string };
  budget: { amount: number; usedPct: number };
}

export interface RecentTransaction {
  id: string;
  merchant: string;
  category: string;
  type: 'expense' | 'income';
  amount: number;
  date: string;
  account?: string;
}

export interface RecentTransactionsResponse {
  items: RecentTransaction[];
}

export interface TrendPoint {
  month: string;
  amount: number;
}

export interface TrendResponse {
  series: TrendPoint[];
}

export interface CreateTransactionInput {
  name: string;
  amount: number;
  category: string;
  date: string;
  type?: 'expense' | 'income';
  account?: string;
}

const MONTHLY_BUDGET = Number(process.env.EXPO_PUBLIC_MONTHLY_BUDGET ?? 5500);
const PROFILE_NAME = process.env.EXPO_PUBLIC_PROFILE_NAME ?? 'Logeswar and Devika';
const PROFILE_GREETING = process.env.EXPO_PUBLIC_PROFILE_GREETING ?? 'Hello Loki and Devi';
const CURRENCY = process.env.EXPO_PUBLIC_CURRENCY ?? 'CAD';

function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateRange(period: SummaryPeriod, from?: string, to?: string) {
  const today = new Date();
  const todayIso = localIsoDate(today);
  if (period === 'range') {
    if (!from || !to || from > to) throw new Error('A valid from and to date are required.');
    return { from, to };
  }
  if (period === 'today') return { from: todayIso, to: todayIso };
  if (period === 'week') {
    const day = today.getDay() || 7;
    today.setDate(today.getDate() - day + 1);
    return { from: localIsoDate(today), to: todayIso };
  }
  today.setDate(1);
  return { from: localIsoDate(today), to: todayIso };
}

function expenseTotal(items: NotionTransaction[]) {
  return items.filter((item) => item.type.toLowerCase() === 'expense')
    .reduce((total, item) => total + item.amount, 0);
}

function toRecent(item: NotionTransaction): RecentTransaction {
  return {
    id: item.id,
    merchant: item.name,
    category: item.category || 'Uncategorized',
    type: item.type.toLowerCase() === 'income' ? 'income' : 'expense',
    amount: item.amount,
    date: item.date,
    account: item.account || undefined,
  };
}

export async function fetchMe(): Promise<MeResponse> {
  return { name: PROFILE_NAME, greeting: PROFILE_GREETING, avatarUrl: null, currency: CURRENCY };
}

export async function fetchSummary(params: { period: SummaryPeriod; from?: string; to?: string }): Promise<SummaryResponse> {
  const current = dateRange(params.period, params.from, params.to);
  const currentItems = await fetchNotionTransactions(current);
  const totalSpend = expenseTotal(currentItems);
  const totalIncome = currentItems.filter((item) => item.type.toLowerCase() === 'income')
    .reduce((total, item) => total + item.amount, 0);
  const days = Math.floor((Date.parse(`${current.to}T00:00:00`) - Date.parse(`${current.from}T00:00:00`)) / 86_400_000) + 1;
  const previousTo = new Date(`${current.from}T00:00:00`);
  previousTo.setDate(previousTo.getDate() - 1);
  const previousFrom = new Date(previousTo);
  previousFrom.setDate(previousFrom.getDate() - days + 1);
  const previousSpend = expenseTotal(await fetchNotionTransactions({
    from: localIsoDate(previousFrom), to: localIsoDate(previousTo),
  }));
  const delta = totalSpend - previousSpend;
  const pct = previousSpend === 0 ? null : Math.round((delta / previousSpend) * 1000) / 10;

  return {
    period: current,
    totalSpend,
    totalIncome,
    transactionCount: currentItems.length,
    dailyAverage: totalSpend / days,
    trend: {
      direction: pct == null ? (totalSpend > 0 ? 'up' : 'flat') : pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat',
      pct,
      label: 'FROM LAST PERIOD',
    },
    budget: { amount: MONTHLY_BUDGET, usedPct: MONTHLY_BUDGET > 0 ? totalSpend / MONTHLY_BUDGET : 0 },
  };
}

export async function fetchRecentTransactions(params: { limit?: number; from?: string; to?: string } = {}): Promise<RecentTransactionsResponse> {
  const items = await fetchNotionTransactions({ from: params.from, to: params.to });
  return { items: items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, params.limit ?? 4).map(toRecent) };
}

export async function fetchTrend(months = 6): Promise<TrendResponse> {
  const now = new Date();
  const series = await Promise.all(Array.from({ length: months }, async (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1);
    const from = localIsoDate(date);
    const to = localIsoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    return { month: from.slice(0, 7), amount: expenseTotal(await fetchNotionTransactions({ from, to })) };
  }));
  return { series };
}

export async function fetchTransactions(params: { from?: string; to?: string } = {}) {
  return (await fetchNotionTransactions(params)).sort((a, b) => b.date.localeCompare(a.date)).map(toRecent);
}

export async function addTransaction(input: CreateTransactionInput) {
  await createNotionTransaction({ ...input, type: input.type ?? 'expense' });
}
