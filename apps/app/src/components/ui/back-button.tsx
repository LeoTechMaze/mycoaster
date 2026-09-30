import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontFamily, Shadows } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Floating circular back button over detail-screen hero photos. */
export function BackButton() {
  const c = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={() => router.back()}
      style={({ pressed }) => [
        styles.button,
        { top: insets.top + 8, backgroundColor: c.card, borderColor: c.border },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.glyph, { color: c.text }]}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.floating,
  },
  pressed: {
    opacity: 0.8,
  },
  glyph: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
});
