import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, FontFamily, Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SegmentedControlProps = {
  segments: string[];
  activeIndex: number;
  onChange?: (index: number) => void;
};

/** White pill container with equal segments; active segment = navy bg, white text. */
export function SegmentedControl({ segments, activeIndex, onChange }: SegmentedControlProps) {
  const c = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: c.card, borderColor: c.border }]}>
      {segments.map((label, i) => {
        const active = i === activeIndex;
        return (
          <Pressable
            key={label}
            accessibilityRole="tab"
            onPress={() => onChange?.(i)}
            style={[styles.segment, active && { backgroundColor: Brand.navy }]}
          >
            <Text style={[styles.label, { color: active ? '#ffffff' : c.textSecondary }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: Radii.pill,
    padding: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: Radii.pill,
  },
  label: {
    fontSize: 12.5,
    fontFamily: FontFamily.bold,
  },
});
