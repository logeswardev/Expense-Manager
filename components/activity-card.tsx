import { getCategoryStyle } from '@/constants/dashboard';
import { Colors } from '@/constants/theme';
import { styles } from '@/styles/activity-card.styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface ActivityCardProps {
  merchant: string;
  date: string;
  category: string;
  amount: number;
  isLast?: boolean;
}

function formatCad(value: number) {
  const abs = Math.abs(value).toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? '-' : '+'}$${abs}`;
}

export default function ActivityCard({ merchant, date, category, amount, isLast }: ActivityCardProps) {
  const { icon, bg, color, label } = getCategoryStyle(category);
  const isIncome = amount >= 0;

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.merchant}>{merchant}</Text>
        <Text style={styles.subtitle}>{date} • {label}</Text>
      </View>
      <Text style={[styles.amount, { color: isIncome ? Colors.income : Colors.red }]}>
        {formatCad(amount)}
      </Text>
    </View>
  );
}
