import { Colors } from '@/constants/theme';
import { StyleSheet } from 'react-native';

const CELL_HEIGHT = 44;
const BUBBLE_SIZE = 36;

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingTop: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { color: Colors.primary, fontSize: 18, fontWeight: '700' },

  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  // Month selector
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  monthTitle: { color: Colors.primary, fontSize: 22, fontWeight: '700' },
  monthNav: { flexDirection: 'row', gap: 8 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Calendar card
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  weekHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  weekText: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textSub,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rangeBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (CELL_HEIGHT - BUBBLE_SIZE) / 2,
    height: BUBBLE_SIZE,
    backgroundColor: Colors.cardAlt,
  },
  rangeBgStart: { left: '50%' },
  rangeBgEnd: { right: '50%' },

  dayBubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubbleActive: {
    backgroundColor: Colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  dayBubbleToday: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dayText: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  dayTextInRange: { color: Colors.primary, fontWeight: '600' },
  dayTextActive: { color: '#FFFFFF', fontWeight: '700' },
  dayTextToday: { color: Colors.primary, fontWeight: '700' },

  // Summary
  sectionLabel: {
    color: Colors.textSub,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 8,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  summarySub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '600' },
  summaryTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 4 },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Presets
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.cardAlt,
  },
  presetActive: { backgroundColor: Colors.primary },
  presetText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  presetTextActive: { color: '#FFFFFF' },

  // Apply
  applyBtn: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  applyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
