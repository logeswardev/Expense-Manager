import type { StatementTransaction } from '@/services/notion-api';

function splitCsvLine(line: string) {
  const values: string[] = [];
  let value = ''; let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { values.push(value.trim()); value = ''; }
    else value += char;
  }
  values.push(value.trim());
  return values;
}

function normalizedHeader(value: string) { return value.toLowerCase().replace(/[^a-z]/g, ''); }
function parseAmount(value: string) {
  const cleaned = value.replace(/[$,\s]/g, '');
  const negative = /^\(.*\)$/.test(cleaned);
  const parsed = Number(cleaned.replace(/[()]/g, ''));
  return Number.isFinite(parsed) ? (negative ? -parsed : parsed) : null;
}

function parseDate(value: string) {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!match) return null;
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
}

/** Parses common bank-export CSV headers: Date, Description, Amount, Debit, Credit. */
export function parseBankStatementCsv(content: string) {
  const rows = content.split(/\r?\n/).filter((row) => row.trim());
  if (rows.length < 2) throw new Error('The CSV does not contain transactions.');
  const headers = splitCsvLine(rows[0]).map(normalizedHeader);
  const dateIndex = headers.findIndex((header) => ['date', 'transactiondate', 'posteddate'].includes(header));
  const nameIndex = headers.findIndex((header) => ['description', 'merchant', 'payee', 'name', 'details', 'memo'].includes(header));
  const amountIndex = headers.findIndex((header) => ['amount', 'transactionamount'].includes(header));
  const debitIndex = headers.findIndex((header) => ['debit', 'withdrawal', 'moneyout'].includes(header));
  const creditIndex = headers.findIndex((header) => ['credit', 'deposit', 'moneyin'].includes(header));
  if (dateIndex < 0 || nameIndex < 0 || (amountIndex < 0 && debitIndex < 0 && creditIndex < 0)) {
    throw new Error('CSV needs Date, Description, and Amount columns (or Debit and Credit columns).');
  }
  const rejected: number[] = [];
  const transactions: StatementTransaction[] = [];
  rows.slice(1).forEach((row, index) => {
    const values = splitCsvLine(row);
    const date = parseDate(values[dateIndex] ?? '');
    const name = values[nameIndex]?.trim();
    const amount = amountIndex >= 0 ? parseAmount(values[amountIndex] ?? '') : null;
    const debit = debitIndex >= 0 ? parseAmount(values[debitIndex] ?? '') : null;
    const credit = creditIndex >= 0 ? parseAmount(values[creditIndex] ?? '') : null;
    const signed = amount ?? ((credit ?? 0) - (debit ?? 0));
    if (!date || !name || !signed) { rejected.push(index + 2); return; }
    transactions.push({ date, name, amount: Math.abs(signed), type: signed < 0 ? 'expense' : 'income' });
  });
  if (!transactions.length) throw new Error('No usable transactions were found in this CSV.');
  return { transactions, rejected };
}

function transactionFromPdfLine(line: string): StatementTransaction | null {
  const dateMatch = line.match(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);
  if (!dateMatch) return null;
  const date = parseDate(dateMatch[1]);
  const amounts = [...line.matchAll(/(?:-?\$?\d[\d,]*\.\d{2}|\(\$?\d[\d,]*\.\d{2}\))/g)];
  const amountMatch = amounts.at(-1)?.[0];
  const signed = amountMatch ? parseAmount(amountMatch) : null;
  if (!date || signed == null || signed === 0) return null;
  const description = line.slice(dateMatch.index! + dateMatch[0].length, line.lastIndexOf(amountMatch!))
    .replace(/\b(balance|debit|credit|amount)\b/gi, '').replace(/\s+/g, ' ').trim();
  if (description.length < 2) return null;
  const expenseWords = /\b(debit|purchase|payment|withdrawal|pos|visa|mastercard)\b/i.test(line);
  const incomeWords = /\b(credit|deposit|refund|interest)\b/i.test(line);
  return { date, name: description.slice(0, 180), amount: Math.abs(signed), type: signed < 0 || (expenseWords && !incomeWords) ? 'expense' : 'income' };
}

type PdfRow = { items: { x: number; text: string }[] };
const CIBC_MONTHS: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function parseCibcRows(rows: PdfRow[], year: number) {
  const transactions: StatementTransaction[] = [];
  let currentDate: string | null = null;
  let last: StatementTransaction | null = null;
  for (const row of rows) {
    const line = row.items.map((item) => item.text).join(' ');
    const dateText = row.items.find((item) => item.x < 90)?.text.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})$/);
    if (dateText) currentDate = `${year}-${String(CIBC_MONTHS[dateText[1]] + 1).padStart(2, '0')}-${dateText[2].padStart(2, '0')}`;
    const amounts = row.items.filter((item) => item.x >= 300 && item.x < 500 && /^\$?-?\d[\d,]*\.\d{2}$/.test(item.text));
    const description = row.items.filter((item) => item.x >= 90 && item.x < 300).map((item) => item.text).join(' ').replace(/\s+/g, ' ').trim();
    const skip = /^(opening balance|balance forward|closing balance|transaction details|date description)/i.test(description);
    if (currentDate && description && amounts.length && !skip) {
      const amount = amounts[0];
      const parsed = parseAmount(amount.text);
      if (parsed != null && parsed > 0) {
        last = { date: currentDate, name: description, amount: parsed, type: amount.x < 390 ? 'expense' : 'income' };
        transactions.push(last);
      }
    } else if (last && currentDate === last.date && description && !skip && !dateText && !amounts.length && !/continued|page \d/i.test(line)) {
      // CIBC wraps some merchant names onto the following visual line.
      last.name = `${last.name} ${description}`.slice(0, 180);
    }
  }
  return transactions;
}

/** Extracts text-based PDFs. Scanned-image PDFs need OCR and are not supported. */
export async function parseBankStatementPdf(file: File) {
  const pdfjs = await import('pdfjs-dist/build/pdf');
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.js';
  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const lines: string[] = [];
  const rows: PdfRow[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const content = await (await document.getPage(pageNumber)).getTextContent();
    const grouped = new Map<number, { x: number; text: string }[]>();
    for (const item of content.items) {
      const text = item.str;
      if (!text?.trim()) continue;
      const y = Math.round(item.transform[5]);
      grouped.set(y, [...(grouped.get(y) ?? []), { x: item.transform[4], text }]);
    }
    [...grouped.entries()].sort(([a], [b]) => b - a).forEach(([, items]) => {
      const ordered = items.sort((a, b) => a.x - b.x);
      rows.push({ items: ordered });
      lines.push(ordered.map((item) => item.text).join(' '));
    });
  }
  const year = Number(lines.join(' ').match(/(?:For\s+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+to\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+(\d{4})/)?.[1]);
  const cibcTransactions = year ? parseCibcRows(rows, year) : [];
  const transactions = cibcTransactions.length ? cibcTransactions : lines.map(transactionFromPdfLine).filter((item): item is StatementTransaction => item != null);
  const unique = Array.from(new Map(transactions.map((item) => [`${item.date}|${item.name}|${item.amount}|${item.type}`, item])).values());
  if (!unique.length) throw new Error('No transactions could be read. Use a text-based PDF export, not a scanned statement.');
  return { transactions: unique, rejected: Math.max(0, lines.length - unique.length) };
}
