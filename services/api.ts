const BASE_URL = 'https://expense-manager-backend-3lxe.onrender.com';

export async function initiateService() {
  const res = await fetch(`${BASE_URL}/initiate`);
  return res.json();
}

// ---------- /dashboard/me ----------

export interface MeResponse {
  name: string;
  greeting: string;
  avatarUrl: string | null;
  currency: string;
}

export async function fetchMe(): Promise<MeResponse> {
  const res = await fetch(`${BASE_URL}/dashboard/me`);
  if (!res.ok) throw new Error(`me request failed: ${res.status}`);
  return res.json();
}

// ---------- /dashboard/summary ----------

export type SummaryPeriod = 'today' | 'week' | 'month' | 'range';

export interface SummaryResponse {
  period: { from: string; to: string; label?: string };
  totalSpend: number;
  totalIncome: number;
  transactionCount: number;
  dailyAverage: number;
  trend: { direction: 'up' | 'down' | 'flat'; pct: number | null; label: string };
  budget: { amount: number; usedPct: number };
}

export async function fetchSummary(params: {
  period: SummaryPeriod;
  from?: string;
  to?: string;
}): Promise<SummaryResponse> {
  const qs = new URLSearchParams({ period: params.period });
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);

  console.log("qs", qs.toString());

  const res = await fetch(`${BASE_URL}/dashboard/summary?${qs.toString()}`);
  if (!res.ok) throw new Error(`summary request failed: ${res.status}`);
  return res.json();
}

// ---------- /dashboard/transactions/recent ----------

export interface RecentTransaction {
  id: string;
  merchant: string;
  category: string;
  type: 'expense' | 'income';
  amount: number;
  date: string;
}

export interface RecentTransactionsResponse {
  items: RecentTransaction[];
}

export async function fetchRecentTransactions(params: {
  limit?: number;
  period?: SummaryPeriod;
  from?: string;
  to?: string;
} = {}): Promise<RecentTransactionsResponse> {
  const { limit = 4, period, from, to } = params;
  const qs = new URLSearchParams({ limit: String(limit) });
  if (period) qs.set('period', period);
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);

  const res = await fetch(`${BASE_URL}/dashboard/transactions/recent?${qs.toString()}`);
  if (!res.ok) throw new Error(`recent transactions request failed: ${res.status}`);
  return res.json();
}

// ---------- /dashboard/trend ----------

export interface TrendPoint {
  month: string; // "2023-10"
  amount: number;
}

export interface TrendResponse {
  series: TrendPoint[];
}

export async function fetchTrend(months = 6): Promise<TrendResponse> {
  const res = await fetch(`${BASE_URL}/dashboard/trend?months=${months}`);
  if (!res.ok) throw new Error(`trend request failed: ${res.status}`);
  return res.json();
}
