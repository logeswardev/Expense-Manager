import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';

// ── Category Data ─────────────────────────────────────────────────────────────
const expenseCategories = [
  { id: '1', label: 'Dining', icon: 'restaurant-outline' as const, color: Colors.amber },
  { id: '2', label: 'Shopping', icon: 'cart-outline' as const, color: Colors.blue },
  { id: '3', label: 'Transport', icon: 'car-outline' as const, color: Colors.teal },
  { id: '4', label: 'Housing', icon: 'home-outline' as const, color: Colors.green },
  { id: '5', label: 'Leisure', icon: 'game-controller-outline' as const, color: '#A78BFA' },
  { id: '6', label: 'Health', icon: 'medkit-outline' as const, color: Colors.red },
  { id: '7', label: 'Bills', icon: 'receipt-outline' as const, color: Colors.amber },
  { id: '8', label: 'More', icon: 'add-outline' as const, color: Colors.textSub },
];

// ── Keypad ────────────────────────────────────────────────────────────────────
const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'backspace'],
];

// ── Screen ────────────────────────────────────────────────────────────────────
export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notes, setNotes] = useState('');

  function handleKey(key: string) {
    if (key === 'backspace') {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (key === '.' && amount.includes('.')) return;
    // Limit to 2 decimal places
    if (amount.includes('.') && amount.split('.')[1]?.length >= 2) return;
    setAmount((prev) => (prev === '0' && key !== '.' ? key : prev + key));
  }

  const displayAmount = parseFloat(amount || '0').toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Transaction Amount</Text>
          <Text style={styles.amountValue}><Text style={styles.amountDollar}>$</Text>{displayAmount}</Text>
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {KEYS.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((key) => (
                <Pressable
                  key={key}
                  style={({ pressed }) => [styles.keyBtn, pressed && styles.keyBtnPressed]}
                  onPress={() => handleKey(key)}>
                  {key === 'backspace' ? (
                    <Ionicons name="backspace-outline" size={22} color={Colors.text} />
                  ) : (
                    <Text style={styles.keyText}>{key}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {/* Date */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Date</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.green} />
            <Text style={styles.dateText}>October 24, 2023</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textSub} style={{ marginLeft: 'auto' }} />
          </View>
        </View>

        {/* Category */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {expenseCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catItem, selectedCategory === cat.id && styles.catItemActive]}
                onPress={() => setSelectedCategory(cat.id)}>
                <View style={[styles.catIcon, { backgroundColor: cat.color + '22' }, selectedCategory === cat.id && { backgroundColor: cat.color + '44' }]}>
                  <Ionicons name={cat.icon} size={20} color={cat.color} />
                </View>
                <Text style={[styles.catLabel, selectedCategory === cat.id && { color: Colors.text }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="What was this for?"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          onPress={() => router.back()}>
          <Text style={styles.saveBtnText}>Save Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },

  amountSection: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: Colors.border, marginHorizontal: 20 },
  amountLabel: { color: Colors.textSub, fontSize: 13, marginBottom: 8 },
  amountValue: { color: Colors.green, fontSize: 46, fontWeight: '800', letterSpacing: -1 },
  amountDollar: { fontSize: 32, fontWeight: '600', color: Colors.green },

  keypad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  keyRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  keyBtn: { flex: 1, height: 58, backgroundColor: Colors.card, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  keyBtnPressed: { backgroundColor: Colors.cardAlt },
  keyText: { color: Colors.text, fontSize: 22, fontWeight: '600' },

  fieldSection: { paddingHorizontal: 20, paddingTop: 16 },
  fieldLabel: { color: Colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 10 },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  dateText: { color: Colors.text, fontSize: 15, flex: 1 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catItem: { width: '20%', alignItems: 'center', gap: 6 },
  catItemActive: {},
  catIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catLabel: { color: Colors.textMuted, fontSize: 11, textAlign: 'center' },

  notesInput: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, color: Colors.text, fontSize: 15, borderWidth: 1, borderColor: Colors.border, textAlignVertical: 'top', minHeight: 80 },

  saveBtn: { marginHorizontal: 20, marginTop: 24, backgroundColor: Colors.green, borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
