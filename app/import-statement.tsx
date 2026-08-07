import { Colors } from '@/constants/theme';
import { parseBankStatementCsv, parseBankStatementPdf } from '@/services/bank-statement';
import { commitStatementImport, fetchStatementCategories, previewStatementImport, StatementTransaction } from '@/services/notion-api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Stage = 'upload' | 'preview' | 'complete';
type RowAction = 'upload' | 'reject';

const DEFAULT_CATEGORY = 'Pending to Review';
const PAGE_SIZE = 10;

function rowKey(item: StatementTransaction) {
  return `${item.date}|${item.type}|${item.amount.toFixed(2)}|${item.name}`;
}

export default function ImportStatementScreen() {
  const [stage, setStage] = useState<Stage>('upload');
  const [missing, setMissing] = useState<StatementTransaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [actions, setActions] = useState<Record<string, RowAction>>({});
  const [actionOpenFor, setActionOpenFor] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStatementCategories()
      .then((names) => {
        if (!names.length) return;
        const merged = names.includes(DEFAULT_CATEGORY) ? names : [DEFAULT_CATEGORY, ...names];
        setCategories(merged);
      })
      .catch(() => {});
  }, []);

  const totalPages = Math.max(1, Math.ceil(missing.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => missing.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [missing, page],
  );
  const uploads = useMemo(
    () => missing.filter((item) => (actions[rowKey(item)] ?? 'upload') === 'upload'),
    [missing, actions],
  );
  const uploadTotal = uploads.reduce((sum, item) => sum + item.amount, 0);

  function selectStatement() {
    if (Platform.OS !== 'web') { setMessage('Bank statement upload is available in the web app.'); return; }
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.pdf,application/pdf,.csv,text/csv';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        setLoading(true); setMessage(null);
        const parsed = file.name.toLowerCase().endsWith('.pdf')
          ? await parseBankStatementPdf(file)
          : parseBankStatementCsv(await file.text());
        const result = await previewStatementImport(parsed.transactions);
        setMissing(result.items);
        setActions(Object.fromEntries(result.items.map((item) => [rowKey(item), 'upload' as RowAction])));
        setPage(0);
        setStage('preview');
        const rejectedCount = Array.isArray(parsed.rejected) ? parsed.rejected.length : parsed.rejected;
        setMessage(`${parsed.transactions.length} transactions read${rejectedCount ? `; ${rejectedCount} row(s) skipped` : ''}.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not read this statement.');
      } finally {
        setLoading(false);
      }
    };
    input.click();
  }

  async function importSelected() {
    if (!uploads.length) { setMessage('Nothing to import — all rows are set to Reject.'); return; }
    try {
      setLoading(true); setMessage(null);
      const result = await commitStatementImport(uploads, category);
      setStage('complete');
      const rejectedCount = missing.length - uploads.length;
      setMessage(`${result.added} transaction${result.added === 1 ? '' : 's'} added to Notion${rejectedCount ? `; ${rejectedCount} rejected` : ''}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not import transactions.');
    } finally {
      setLoading(false);
    }
  }

  const categoryOptions = categories.length ? categories : [DEFAULT_CATEGORY];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.close} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Import bank statement</Text>
          <View style={styles.close} />
        </View>

        <View style={styles.hero}>
          <Ionicons name="cloud-upload-outline" size={38} color={Colors.primary} />
          <Text style={styles.heroTitle}>Compare with Notion</Text>
          <Text style={styles.heroText}>Upload a bank-statement PDF or CSV. Review each transaction, then decide which ones go to Notion.</Text>
        </View>

        {stage === 'upload' && (
          <TouchableOpacity style={styles.upload} onPress={selectStatement} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : (
              <>
                <Ionicons name="document-outline" size={22} color="#FFFFFF" />
                <Text style={styles.uploadText}>Choose PDF or CSV statement</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {stage === 'preview' && (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryValue}>{uploads.length}</Text>
              <Text style={styles.summaryLabel}>of {missing.length} will be added to Notion</Text>
              <Text style={styles.summaryAmount}>${uploadTotal.toFixed(2)} total</Text>
            </View>

            <Text style={styles.label}>Notion category</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setCategoryOpen(true)}>
              <Text style={styles.dropdownText}>{category}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textSub} />
            </TouchableOpacity>
            <Text style={styles.hint}>
              {categories.length ? 'This category is applied to every row marked Upload.' : 'Loading Notion categories…'}
            </Text>

            <View style={styles.sectionRow}>
              <Text style={styles.section}>Review transactions</Text>
              <Text style={styles.pageInfo}>Page {page + 1} of {totalPages}</Text>
            </View>

            {pageItems.map((item) => {
              const key = rowKey(item);
              const action: RowAction = actions[key] ?? 'upload';
              const rejected = action === 'reject';
              return (
                <View key={key} style={[styles.row, rejected && styles.rowRejected]}>
                  <View style={styles.rowIcon}>
                    <Ionicons
                      name={item.type === 'income' ? 'arrow-down-outline' : 'arrow-up-outline'}
                      size={18}
                      color={item.type === 'income' ? Colors.income : Colors.red}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, rejected && styles.strike]} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.meta}>{item.date} • {item.type}</Text>
                  </View>
                  <Text
                    style={[
                      styles.amount,
                      { color: item.type === 'income' ? Colors.income : Colors.red },
                      rejected && styles.strike,
                    ]}
                  >
                    {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionPill, rejected ? styles.actionReject : styles.actionUpload]}
                    onPress={() => setActionOpenFor(key)}
                  >
                    <Text style={[styles.actionPillText, rejected ? styles.actionRejectText : styles.actionUploadText]}>
                      {rejected ? 'Reject' : 'Upload'}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={rejected ? Colors.red : '#FFFFFF'} />
                  </TouchableOpacity>
                </View>
              );
            })}

            <View style={styles.pager}>
              <TouchableOpacity
                style={[styles.pagerButton, page === 0 && styles.pagerDisabled]}
                disabled={page === 0}
                onPress={() => setPage((p) => Math.max(0, p - 1))}
              >
                <Ionicons name="chevron-back" size={18} color={page === 0 ? Colors.textMuted : Colors.text} />
                <Text style={[styles.pagerText, page === 0 && { color: Colors.textMuted }]}>Prev</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pagerButton, page >= totalPages - 1 && styles.pagerDisabled]}
                disabled={page >= totalPages - 1}
                onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                <Text style={[styles.pagerText, page >= totalPages - 1 && { color: Colors.textMuted }]}>Next</Text>
                <Ionicons name="chevron-forward" size={18} color={page >= totalPages - 1 ? Colors.textMuted : Colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.import} disabled={loading || !uploads.length} onPress={importSelected}>
              <Text style={styles.importText}>{loading ? 'Importing…' : `Add ${uploads.length} to Notion`}</Text>
            </TouchableOpacity>
          </>
        )}

        {stage === 'complete' && (
          <TouchableOpacity style={styles.import} onPress={() => router.replace('/(tabs)/activity' as any)}>
            <Text style={styles.importText}>View activity</Text>
          </TouchableOpacity>
        )}

        {message && <Text style={styles.message}>{message}</Text>}
        <Text style={styles.note}>PDF and CSV supported. PDFs must contain selectable text; scanned/image-only statements need OCR and are not supported.</Text>
      </ScrollView>

      <Modal transparent visible={categoryOpen} animationType="fade" onRequestClose={() => setCategoryOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCategoryOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Notion category</Text>
            <ScrollView style={styles.modalList}>
              {categoryOptions.map((name) => (
                <TouchableOpacity
                  key={name}
                  style={[styles.modalItem, name === category && styles.modalItemActive]}
                  onPress={() => { setCategory(name); setCategoryOpen(false); }}
                >
                  <Text style={[styles.modalItemText, name === category && styles.modalItemActiveText]}>{name}</Text>
                  {name === category && <Ionicons name="checkmark" size={18} color={Colors.text} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={!!actionOpenFor} animationType="fade" onRequestClose={() => setActionOpenFor(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setActionOpenFor(null)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>Row action</Text>
            {(['upload', 'reject'] as RowAction[]).map((option) => {
              const key = actionOpenFor;
              const current: RowAction = key ? actions[key] ?? 'upload' : 'upload';
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.modalItem, current === option && styles.modalItemActive]}
                  onPress={() => {
                    if (!key) return;
                    setActions((prev) => ({ ...prev, [key]: option }));
                    setActionOpenFor(null);
                  }}
                >
                  <Text style={[styles.modalItemText, current === option && styles.modalItemActiveText]}>
                    {option === 'upload' ? 'Upload to Notion' : 'Reject (skip)'}
                  </Text>
                  {current === option && <Ionicons name="checkmark" size={18} color={Colors.text} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  hero: { backgroundColor: Colors.card, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, padding: 24, alignItems: 'center', marginTop: 28 },
  heroTitle: { color: Colors.text, fontSize: 21, fontWeight: '800', marginTop: 12 },
  heroText: { color: Colors.textSub, fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  upload: { flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 14, padding: 18, marginTop: 20 },
  uploadText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  summary: { alignItems: 'center', padding: 20, marginTop: 20 },
  summaryValue: { color: Colors.primary, fontSize: 42, fontWeight: '800' },
  summaryLabel: { color: Colors.textSub, fontSize: 14 },
  summaryAmount: { color: Colors.text, fontSize: 18, fontWeight: '800', marginTop: 6 },
  label: { color: Colors.textSub, fontSize: 13, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.card, borderColor: Colors.border, borderWidth: 1, borderRadius: 12, padding: 14 },
  dropdownText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  hint: { color: Colors.textMuted, fontSize: 12, marginTop: 8 },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 24, marginBottom: 8 },
  section: { color: Colors.text, fontSize: 17, fontWeight: '800' },
  pageInfo: { color: Colors.textSub, fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, backgroundColor: Colors.card, marginBottom: 8 },
  rowRejected: { opacity: 0.55 },
  rowIcon: { width: 36, height: 36, backgroundColor: Colors.cardAlt, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  name: { color: Colors.text, fontWeight: '700', fontSize: 14 },
  meta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  amount: { fontWeight: '800', fontSize: 14, marginLeft: 8 },
  strike: { textDecorationLine: 'line-through' },
  actionPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginLeft: 8 },
  actionUpload: { backgroundColor: Colors.primary },
  actionReject: { backgroundColor: Colors.redLight, borderWidth: 1, borderColor: Colors.red },
  actionPillText: { fontSize: 12, fontWeight: '700' },
  actionUploadText: { color: '#FFFFFF' },
  actionRejectText: { color: Colors.red },
  pager: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 8 },
  pagerButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  pagerDisabled: { opacity: 0.5 },
  pagerText: { color: Colors.text, fontWeight: '700', fontSize: 13 },
  import: { backgroundColor: Colors.primary, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 16 },
  importText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  message: { color: Colors.textSub, fontSize: 13, marginTop: 12, textAlign: 'center' },
  note: { color: Colors.textMuted, fontSize: 12, marginTop: 24, textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, width: '100%', maxWidth: 420, maxHeight: '70%' },
  modalTitle: { color: Colors.text, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  modalList: { maxHeight: 360 },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10 },
  modalItemActive: { backgroundColor: Colors.cardAlt },
  modalItemText: { color: Colors.text, fontSize: 15 },
  modalItemActiveText: { fontWeight: '700' },
});
