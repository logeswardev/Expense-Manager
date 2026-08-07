import { createTransaction, queryTransactions } from '@/lib/notion';

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
  return { items: unique.filter((transaction) => !existingKeys.has(key(transaction))), skipped: raw.length - unique.length };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { transactions?: unknown; category?: string; account?: string; action?: string };
    const comparison = await missingTransactions(body.transactions);
    if (body.action === 'preview') {
      return Response.json(comparison, { headers: { 'Cache-Control': 'no-store' } });
    }
    if (body.action !== 'commit') {
      return Response.json({ message: 'Use preview or commit.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    if (!body.category?.trim()) {
      return Response.json({ message: 'Choose a Notion category for imported transactions.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    for (const transaction of comparison.items) {
      await createTransaction({ ...transaction, category: body.category, account: body.account });
    }
    return Response.json(
      { added: comparison.items.length, skipped: comparison.skipped },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : 'Could not import statement.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
