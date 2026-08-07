import { createTransaction, queryTransactions } from '../../lib/notion';

type VercelRequest = { method?: string; body?: unknown };
type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

type ImportTransaction = { date: string; name: string; amount: number; type: 'expense' | 'income' };

function key(transaction: { date: string; name: string; amount: number; type: string }) {
  return [
    transaction.date,
    transaction.type.toLowerCase(),
    Math.abs(transaction.amount).toFixed(2),
    transaction.name.trim().toLowerCase().replace(/\s+/g, ' '),
  ].join('|');
}

function valid(transaction: any): transaction is ImportTransaction {
  return typeof transaction?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(transaction.date)
    && typeof transaction?.name === 'string' && transaction.name.trim().length > 0
    && typeof transaction?.amount === 'number' && Number.isFinite(transaction.amount) && transaction.amount > 0
    && (transaction.type === 'expense' || transaction.type === 'income');
}

async function missingTransactions(raw: unknown) {
  if (!Array.isArray(raw)) throw new Error('Transactions must be an array.');
  const unique = Array.from(new Map(raw.filter(valid).map((transaction) => [key(transaction), transaction])).values());
  if (!unique.length) return { items: [] as ImportTransaction[], skipped: raw.length };
  const dates = unique.map((transaction) => transaction.date).sort();
  const existing = await queryTransactions(dates[0], dates[dates.length - 1]);
  const existingKeys = new Set(existing.map(key));
  return {
    items: unique.filter((transaction) => !existingKeys.has(key(transaction))),
    skipped: raw.length - unique.length,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' });
  try {
    const body = (req.body ?? {}) as { transactions?: unknown; category?: string; account?: string; action?: string };
    const comparison = await missingTransactions(body.transactions);
    if (body.action === 'preview') return res.status(200).json(comparison);
    if (body.action !== 'commit') return res.status(400).json({ message: 'Use preview or commit.' });
    if (!body.category?.trim()) return res.status(400).json({ message: 'Choose a Notion category for imported transactions.' });
    for (const transaction of comparison.items) {
      await createTransaction({ ...transaction, category: body.category, account: body.account });
    }
    return res.status(201).json({ added: comparison.items.length, skipped: comparison.skipped });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Could not import statement.' });
  }
}
