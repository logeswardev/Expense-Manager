import { DONUT_SEGMENTS } from '@/constants/dashboard';
import { styles } from '@/styles/donut-chart.styles';
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const SIZE = 200;
const STROKE_WIDTH = 26;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 6;

export default function DonutChart() {
  let offset = 0;

  return (
    <View style={styles.wrapper}>
      <Svg width={SIZE} height={SIZE}>
        <G rotation="-90" origin={`${CX}, ${CY}`}>
          <Circle
            cx={CX} cy={CY} r={RADIUS}
            stroke="#1A2540"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {DONUT_SEGMENTS.map((seg, i) => {
            const dash = CIRCUMFERENCE * seg.pct - GAP;
            const currentOffset = -offset * CIRCUMFERENCE - (i * GAP) / 2;
            offset += seg.pct;
            return (
              <Circle
                key={i}
                cx={CX} cy={CY} r={RADIUS}
                stroke={seg.color}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
                strokeDashoffset={currentOffset}
                strokeLinecap="round"
              />
            );
          })}
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.label}>Used</Text>
        <Text style={styles.pct}>82%</Text>
      </View>
    </View>
  );
}
