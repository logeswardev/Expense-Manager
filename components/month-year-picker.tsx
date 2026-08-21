import { MONTHS_GRID } from '@/constants/dashboard';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface MonthSelection {
  year: number;
  monthIdx: number;
  from: string;
  to: string;
  label: string;
}

function pad(value: number) { return String(value).padStart(2, '0'); }

export function monthRange(year: number, monthIdx: number): MonthSelection {
  const last = new Date(year, monthIdx + 1, 0).getDate();
  const label = `${MONTHS_GRID[monthIdx]} ${year}`;
  return {
    year,
    monthIdx,
    from: `${year}-${pad(monthIdx + 1)}-01`,
    to: `${year}-${pad(monthIdx + 1)}-${pad(last)}`,
    label,
  };
}

interface Props {
  visible: boolean;
  year: number;
  monthIdx: number;
  onClose: () => void;
  onSelect: (selection: MonthSelection) => void;
}

export default function MonthYearPicker({ visible, year, monthIdx, onClose, onSelect }: Props) {
  const [pickerYear, setPickerYear] = useState(year);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.navBtn} onPress={() => setPickerYear((value) => value - 1)}>
              <Ionicons name="chevron-back" size={20} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.year}>{pickerYear}</Text>
            <TouchableOpacity style={styles.navBtn} onPress={() => setPickerYear((value) => value + 1)}>
              <Ionicons name="chevron-forward" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {MONTHS_GRID.map((name, index) => {
              const isSelected = pickerYear === year && index === monthIdx;
              return (
                <TouchableOpacity
                  key={name}
                  style={[styles.cell, isSelected && styles.cellActive]}
                  onPress={() => { onSelect(monthRange(pickerYear, index)); onClose(); }}
                >
                  <Text style={[styles.cellText, isSelected && styles.cellTextActive]}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, width: '100%', maxWidth: 360 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  year: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '30%', flexGrow: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.cardAlt, alignItems: 'center' },
  cellActive: { backgroundColor: Colors.primary },
  cellText: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  cellTextActive: { color: '#FFFFFF' },
});
