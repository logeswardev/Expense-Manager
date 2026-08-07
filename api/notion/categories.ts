import { queryCategories } from '../../lib/notion';

type VercelRequest = { method?: string };
type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed.' });
  try {
    return res.status(200).json({ items: await queryCategories() });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Could not load categories.' });
  }
}
