import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { FontFamily, Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SheetProps = {
  title: string;
  /** Small secondary line under the title (optional). */
  subtitle?: string;
  children?: React.ReactNode;
};

/**
 * Bottom-sheet chrome for modal routes: grabber (40×4), 26pt top radius
 * (applied by the stack's formSheet presentation), header with title + Close.
 */
export function Sheet({ title, subtitle, children }: SheetProps) {
  const c = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.sheet, { backgroundColor: c.card }]}>
      <View style={[styles.grabber, { backgroundColor: c.border }]} />
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text style={[styles.close, { color: c.textMuted }]}>Close</Text>
        </Pressable>
      </View>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
  },
  close: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
});
