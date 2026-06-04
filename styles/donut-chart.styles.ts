import { Colors } from '@/constants/theme';
import { StyleSheet } from 'react-native';

const SIZE = 200;

export const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { position: 'absolute', alignItems: 'center' },
  label: { fontSize: 13, color: Colors.textSub, marginBottom: 2 },
  pct: { fontSize: 26, fontWeight: '800', color: Colors.text },
});
