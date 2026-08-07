import { createTransaction, queryTransactions } from '@/lib/notion';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;
    const items = await queryTransactions(from, to);
    return Response.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : 'Unexpected server error.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await createTransaction(body);
    return Response.json({ message: 'Transaction created.' }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : 'Unexpected server error.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
