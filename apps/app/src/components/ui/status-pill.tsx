import { StyleSheet, Text, View } from 'react-native';

import { FontFamily, Radii, StatusColors, type CoasterStatus } from '@/constants/theme';

export function StatusPill({ status }: { status: CoasterStatus }) {
  const s = StatusColors[status];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.label, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
  },
});
