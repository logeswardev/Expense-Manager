import { queryCategories } from '@/lib/notion';

export async function GET() {
  try {
    const items = await queryCategories();
    return Response.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : 'Could not load categories.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
