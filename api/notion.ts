import { createTransaction, queryTransactions } from '../lib/notion';

type VercelRequest = { method?: string; query: Record<string, string | string[] | undefined>; body?: unknown };
type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const from = Array.isArray(req.query.from) ? req.query.from[0] : req.query.from;
      const to = Array.isArray(req.query.to) ? req.query.to[0] : req.query.to;
      return res.status(200).json({ items: await queryTransactions(from, to) });
    }
    if (req.method === 'POST') {
      await createTransaction(req.body);
      return res.status(201).json({ message: 'Transaction created.' });
    }
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Unexpected server error.' });
  }
}
