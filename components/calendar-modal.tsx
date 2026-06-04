import { MONTHS_FULL } from '@/constants/dashboard';
import { Colors } from '@/constants/theme';
import { styles } from '@/styles/calendar-modal.styles';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface CalendarModalProps {
  visible: boolean;
  selectedMonth: string;
  onApply: (month: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const PRESETS = ['Last 7 Days', 'Last 30 Days', 'Year to Date'] as const;
type Preset = (typeof PRESETS)[number];

function daysInMonth(year: number, monthIdx: number) {
  return new Date(year, monthIdx + 1, 0).getDate();
}

// Monday-first leading offset for the 1st of the month.
function leadingBlanks(year: number, monthIdx: number) {
  const dow = new Date(year, monthIdx, 1).getDay(); // 0 = Sun
  return (dow + 6) % 7;
}

function shortMonth(monthIdx: number) {
  return MONTHS_FULL[monthIdx].slice(0, 3);
}

export default function CalendarModal({ visible, selectedMonth, onApply, onClose }: CalendarModalProps) {
  const initialMonthIdx = Math.max(0, MONTHS_FULL.indexOf(selectedMonth));
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [monthIdx, setMonthIdx] = useState(initialMonthIdx);
  const [rangeStart, setRangeStart] = useState<number | null>(1);
  const [rangeEnd, setRangeEnd] = useState<number | null>(15);
  const [preset, setPreset] = useState<Preset | null>('Last 30 Days');

  const totalDays = daysInMonth(year, monthIdx);
  const blanks = leadingBlanks(year, monthIdx);
  const cells = useMemo(
    () => [
      ...Array.from({ length: blanks }, () => null),
      ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ],
    [blanks, totalDays],
  );

  function pickDay(day: number) {
    setPreset(null);
    if (rangeStart == null || (rangeStart != null && rangeEnd != null)) {
      setRangeStart(day);
      setRangeEnd(null);
      return;
    }
    if (day < rangeStart) {
      setRangeEnd(rangeStart);
      setRangeStart(day);
    } else {
      setRangeEnd(day);
    }
  }

  function changeMonth(delta: number) {
    let m = monthIdx + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonthIdx(m);
    setYear(y);
    setRangeStart(null);
    setRangeEnd(null);
  }

  const isToday = (day: number) =>
    year === today.getFullYear() && monthIdx === today.getMonth() && day === today.getDate();

  const inRange = (day: number) =>
    rangeStart != null && rangeEnd != null && day > rangeStart && day < rangeEnd;
  const isStart = (day: number) => rangeStart === day && rangeEnd != null;
  const isEnd = (day: number) => rangeEnd === day;
  const isSingle = (day: number) => rangeStart === day && rangeEnd == null;

  const summaryText = (() => {
    if (rangeStart == null) return 'No dates selected';
    if (rangeEnd == null) return `${shortMonth(monthIdx)} ${rangeStart}, ${year}`;
    return `${shortMonth(monthIdx)} ${rangeStart} - ${shortMonth(monthIdx)} ${rangeEnd}, ${year}`;
  })();

  const dayCount = rangeStart != null && rangeEnd != null ? rangeEnd - rangeStart + 1 : rangeStart != null ? 1 : 0;

  function handleApply() {
    onApply(MONTHS_FULL[monthIdx]);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn} hitSlop={8}>
              <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Dates</Text>
            <View style={styles.headerBtn} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Month selector */}
            <View style={styles.monthRow}>
              <Text style={styles.monthTitle}>{MONTHS_FULL[monthIdx]} {year}</Text>
              <View style={styles.monthNav}>
                <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(-1)}>
                  <Ionicons name="chevron-back" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(1)}>
                  <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Calendar card */}
            <View style={styles.card}>
              <View style={styles.weekHeader}>
                {WEEKDAYS.map((d) => (
                  <Text key={d} style={styles.weekText}>{d}</Text>
                ))}
              </View>

              <View style={styles.grid}>
                {cells.map((day, i) => {
                  if (day == null) {
                    return <View key={`b-${i}`} style={styles.cell} />;
                  }

                  const start = isStart(day);
                  const end = isEnd(day);
                  const single = isSingle(day);
                  const range = inRange(day);
                  const todayCell = isToday(day);

                  return (
                    <Pressable key={day} onPress={() => pickDay(day)} style={styles.cell}>
                      {(range || start || end) && (
                        <View
                          style={[
                            styles.rangeBg,
                            start && styles.rangeBgStart,
                            end && styles.rangeBgEnd,
                          ]}
                        />
                      )}
                      <View
                        style={[
                          styles.dayBubble,
                          (start || end || single) && styles.dayBubbleActive,
                          todayCell && !(start || end || single) && styles.dayBubbleToday,
                        ]}>
                        <Text
                          style={[
                            styles.dayText,
                            range && styles.dayTextInRange,
                            (start || end || single) && styles.dayTextActive,
                            todayCell && !(start || end || single) && styles.dayTextToday,
                          ]}>
                          {day}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Selected period summary */}
            <Text style={styles.sectionLabel}>SELECTED PERIOD</Text>
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summarySub}>{summaryText}</Text>
                <Text style={styles.summaryTitle}>
                  {dayCount > 0 ? `${dayCount} Day${dayCount === 1 ? '' : 's'} Selected` : 'Select a range'}
                </Text>
              </View>
              <View style={styles.summaryIcon}>
                <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
              </View>
            </View>

            {/* Presets */}
            <View style={styles.presets}>
              {PRESETS.map((p) => {
                const active = preset === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.preset, active && styles.presetActive]}
                    onPress={() => setPreset(p)}>
                    <Text style={[styles.presetText, active && styles.presetTextActive]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Apply */}
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.85}>
              <Text style={styles.applyText}>Apply Filter</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
