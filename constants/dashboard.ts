import { Ionicons } from '@expo/vector-icons';
import { Colors } from './theme';

// --- Month data ---

export const MONTHS_ROW = ['March', 'April', 'May', 'June', 'July'];

export const MONTHS_GRID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// --- Time filters ---

export const TIME_FILTERS = ['Today', 'This week', 'This month'] as const;
export type TimeFilter = (typeof TIME_FILTERS)[number];

// --- Chart data (kept for legacy donut usage) ---

export const DONUT_SEGMENTS = [
  { pct: 0.35, color: '#1B1B1B' },
  { pct: 0.25, color: '#4C4546' },
  { pct: 0.28, color: '#7E7576' },
  { pct: 0.12, color: '#CFC4C5' },
];

export const DONUT_LEGEND = [
  { label: 'Groceries', color: '#1B1B1B' },
  { label: 'Dining Out', color: '#4C4546' },
  { label: 'Travel', color: '#7E7576' },
  { label: 'Other', color: '#CFC4C5' },
];

// --- Recent activity (mock) ---

export const RECENT_ACTIVITY = [
  { id: '1', merchant: 'The Green Bistro', date: '11:21:48 AM', category: 'food',      amount: -8500 },
  { id: '2', merchant: 'Whole Foods',      date: '09:15:22 AM', category: 'groceries', amount: -25300 },
  { id: '3', merchant: 'Bolt Ride',        date: '08:45:10 AM', category: 'transport', amount: -3200 },
  { id: '4', merchant: 'Account Top-up',   date: 'Yesterday',   category: 'salary',    amount: 150000 },
];

// --- Category helpers ---

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORY_MAP: Record<string, { icon: IoniconsName; label: string }> = {
  food:      { icon: 'restaurant-outline', label: 'Food' },
  dining:    { icon: 'restaurant-outline', label: 'Dining' },
  groceries: { icon: 'basket-outline',     label: 'Groceries' },
  transport: { icon: 'car-outline',        label: 'Transport' },
  travel:    { icon: 'airplane-outline',   label: 'Travel' },
  salary:    { icon: 'add-circle',         label: 'Salary' },
};

const DEFAULT_CATEGORY = { icon: 'pricetag-outline' as IoniconsName, label: 'Other' };

export function getCategoryStyle(category: string) {
  const entry = CATEGORY_MAP[category] ?? DEFAULT_CATEGORY;
  return { ...entry, bg: Colors.cardAlt, color: Colors.primary };
}
