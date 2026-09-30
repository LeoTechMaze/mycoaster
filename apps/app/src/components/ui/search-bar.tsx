import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { FontFamily, Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SearchBarProps = Omit<PressableProps, 'style'> & {
  placeholder?: string;
};

/** Static search pill (pseudo-input) — pressing it navigates rather than typing. */
export function SearchBar({ placeholder = 'Search parks or coasters…', ...rest }: SearchBarProps) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="search"
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: c.card, borderColor: c.border },
        pressed && styles.pressed,
      ]}
      {...rest}
    >
      <Text style={[styles.placeholder, { color: c.textMuted }]}>⌕ {placeholder}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: Radii.pill,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  pressed: {
    opacity: 0.8,
  },
  placeholder: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
  },
});
