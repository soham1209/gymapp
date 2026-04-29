import { StyleSheet, Text, TextProps } from 'react-native';

import { palette } from '@/utils/theme';

export function SectionTitle(props: TextProps) {
  return <Text {...props} style={[styles.text, props.style]} />;
}

const styles = StyleSheet.create({
  text: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
