import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/utils/theme';

type StatChipProps = {
  label: string;
  value: string;
};

export function StatChip({ label, value }: StatChipProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: palette.border,
    borderWidth: 2,
    flex: 1,
    gap: 6,
    minWidth: 96,
    padding: 12,
  },
  value: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
  },
  label: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
