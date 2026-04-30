import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { appShadows, palette } from '@/utils/theme';

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
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    ...appShadows.block,
  },
});
