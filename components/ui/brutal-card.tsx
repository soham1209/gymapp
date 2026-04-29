import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { brutalShadows, palette } from '@/utils/theme';

type BrutalCardProps = PropsWithChildren<ViewProps>;

export function BrutalCard({ children, style, ...props }: BrutalCardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 2,
    padding: 16,
    ...brutalShadows.block,
  },
});
