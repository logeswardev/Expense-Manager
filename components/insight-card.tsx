import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export interface InsightCardProps {
  label: string;
  amount?: number | null;
  amountText?: string;
  subtitle?: string;
  icon: IoniconsName;
  loading?: boolean;
  variant?: 'primary' | 'income' | 'recurring';
  onPress?: () => void;
}

function formatCad(value: number) {
  return `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InsightCard({ label, amount, amountText, subtitle, icon, loading, variant = 'primary', onPress }: InsightCardProps) {
  const bg = variant === 'income' ? Colors.income : variant === 'recurring' ? Colors.amber : Colors.primary;
  const chipBg = 'rgba(255,255,255,0.15)';
  const display = amountText ?? (amount == null ? '—' : formatCad(amount));

  return (
    <TouchableOpacity activeOpacity={onPress ? 0.85 : 1} onPress={onPress} disabled={!onPress} style={[styles.card, { backgroundColor: bg }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: chipBg }]}>
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </View>
        {onPress && <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />}
      </View>
      <Text style={styles.label}>{label}</Text>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" style={{ marginTop: 8, alignSelf: 'flex-start' }} />
      ) : (
        <Text style={styles.amount}>{display}</Text>
      )}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  amount: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600', marginTop: 8 },
});
