const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2025-09-03';
const ENV = {
  NOTION_TOKEN: process.env.NOTION_TOKEN,
  NOTION_TRANSACTIONS_DATA_SOURCE_ID: process.env.NOTION_TRANSACTIONS_DATA_SOURCE_ID,
  NOTION_DEFAULT_ACCOUNT: process.env.NOTION_DEFAULT_ACCOUNT,
};

function required(name: keyof typeof ENV) {
  const value = ENV[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function notion(path: string, init: RequestInit = {}) {
  const response = await fetch(`${NOTION_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${required('NOTION_TOKEN')}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!response.ok) throw new Error(`Notion request failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
  return response.json();
}

function text(node: any) { return node?.[0]?.plain_text ?? node?.[0]?.text?.content ?? ''; }

function rollupText(property: any) {
  const values = property?.rollup?.array;
  if (!Array.isArray(values) || values.length === 0) return '';
  return values
    .map((entry) => text(entry?.title) || text(entry?.rich_text) || entry?.name || '')
    .filter(Boolean)
    .join(', ');
}

function parseTransaction(page: any) {
  const properties = page.properties ?? {};
  return {
    id: page.id,
    name: text(properties.Name?.title),
    amount: properties.Amount?.number ?? 0,
    date: properties.Date?.date?.start ?? '',
    type: properties.Type?.select?.name ?? 'Expense',
    category: text(properties['Display Categories']?.rollup?.array?.[0]?.title),
    account:
      rollupText(properties['Display Accounts']) ||
      rollupText(properties.Account) ||
      rollupText(properties.Accounts),
  };
}

export async function queryCategories() {
  const dataSourceId = required('NOTION_TRANSACTIONS_DATA_SOURCE_ID');
  const schema = await notion(`/data_sources/${dataSourceId}`);
  const categorySource = await relationSource(schema, 'Categories');
  const names: string[] = [];
  let cursor: string | undefined;
  do {
    const response = await notion(`/data_sources/${categorySource}/query`, {
      method: 'POST',
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    for (const item of response.results ?? []) {
      const name = text(item.properties?.Name?.title);
      if (name) names.push(name);
    }
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
}

export async function queryTransactions(from?: string, to?: string) {
  const results: any[] = [];
  let cursor: string | undefined;
  do {
    const filters = from && to ? [{ property: 'Date', date: { on_or_after: from } }, { property: 'Date', date: { on_or_before: to } }] : [];
    const response = await notion(`/data_sources/${required('NOTION_TRANSACTIONS_DATA_SOURCE_ID')}/query`, {
      method: 'POST',
      body: JSON.stringify({ page_size: 100, ...(filters.length ? { filter: { and: filters } } : {}), ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    results.push(...(response.results ?? []));
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return results.map(parseTransaction);
}

async function relationSource(schema: any, name: string) {
  const relation = schema.properties?.[name]?.relation;
  if (relation?.data_source_id) return relation.data_source_id;
  if (!relation?.database_id) throw new Error(`Notion property "${name}" must be a relation.`);
  const database = await notion(`/databases/${relation.database_id}`);
  if (!database.data_sources?.[0]?.id) throw new Error(`No source found for Notion relation "${name}".`);
  return database.data_sources[0].id;
}

async function pageIdByName(dataSourceId: string, name: string) {
  const response = await notion(`/data_sources/${dataSourceId}/query`, { method: 'POST', body: JSON.stringify({ page_size: 100 }) });
  const page = (response.results ?? []).find((item: any) => text(item.properties?.Name?.title).toLowerCase() === name.toLowerCase());
  if (!page) throw new Error(`No Notion record named "${name}" was found.`);
  return page.id;
}

export async function createTransaction(input: any) {
  if (!input?.name?.trim() || !Number.isFinite(input.amount) || input.amount <= 0 || !input.category || !input.date) {
    throw new Error('Name, a positive amount, category, and date are required.');
  }
  const dataSourceId = required('NOTION_TRANSACTIONS_DATA_SOURCE_ID');
  const schema = await notion(`/data_sources/${dataSourceId}`);
  const [categorySource, accountSource, monthSource] = await Promise.all([
    relationSource(schema, 'Categories'), relationSource(schema, 'Accounts'), relationSource(schema, 'Months'),
  ]);
  const account = input.account ?? required('NOTION_DEFAULT_ACCOUNT');
  const month = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(`${input.date}T00:00:00`));
  const [categoryId, accountId, monthId] = await Promise.all([
    pageIdByName(categorySource, input.category), pageIdByName(accountSource, account), pageIdByName(monthSource, month),
  ]);
  await notion('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { data_source_id: dataSourceId },
      properties: {
        Name: { title: [{ text: { content: input.name.trim() } }] }, Date: { date: { start: input.date } },
        Amount: { number: input.amount }, Type: { select: { name: String(input.type).toLowerCase() === 'income' ? 'Income' : 'Expense' } },
        Categories: { relation: [{ id: categoryId }] }, Accounts: { relation: [{ id: accountId }] }, Months: { relation: [{ id: monthId }] },
      },
    }),
  });
}
