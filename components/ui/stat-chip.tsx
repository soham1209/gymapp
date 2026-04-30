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
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minWidth: 110,
    padding: 14,
  },
  value: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '500',
  },
});
