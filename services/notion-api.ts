export interface NotionTransaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: string;
  category: string;
}

type CreateTransactionInput = {
  name: string;
  amount: number;
  category: string;
  date: string;
  type?: 'expense' | 'income';
  account?: string;
};

const API_URL = '/api/notion';

async function request(path = '', init: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? `Request failed (${response.status}).`);
  return payload;
}

export async function fetchNotionTransactions(params: { from?: string; to?: string } = {}): Promise<NotionTransaction[]> {
  const query = new URLSearchParams();
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  return (await request(query.size ? `?${query}` : '')).items ?? [];
}

export async function createNotionTransaction(input: CreateTransactionInput) {
  await request('', { method: 'POST', body: JSON.stringify(input) });
}
