import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ui/progress-bar';
import { StripedPlaceholder } from '@/components/ui/striped-placeholder';
import { Brand, FontFamily, Radii, Shadows } from '@/constants/theme';
import type { MockPark } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

export type ParkCardProps = {
  park: MockPark;
  /** 'home' shows the photo header on parks flagged hasHero; 'explore' is text-only with a ratio. */
  variant?: 'home' | 'explore';
  onPress?: () => void;
};

export function ParkCard({ park, variant = 'home', onPress }: ParkCardProps) {
  const c = useTheme();
  const pct = park.total ? Math.round((park.ridden / park.total) * 100) : 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.card, borderColor: pressed ? Brand.blue : c.border },
      ]}
    >
      {variant === 'home' && park.hasHero ? (
        <StripedPlaceholder hueA={park.hueA} hueB={park.hueB} label="park photo" style={styles.hero}>
          <View style={styles.kmPill}>
            <Text style={styles.kmPillText}>{park.kmLabel}</Text>
          </View>
        </StripedPlaceholder>
      ) : null}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: c.text }]}>{park.name}</Text>
          <Text style={styles.rating}>★ {park.rating}</Text>
        </View>
        <Text style={[styles.meta, { color: c.textSecondary }]}>
          {park.location} · {park.total} coasters
          {variant === 'explore' ? ` · ${park.kmLabel}` : ''}
        </Text>

        {variant === 'explore' ? (
          <View style={styles.barRow}>
            <ProgressBar pct={pct} style={styles.barFlex} />
            <Text style={[styles.ratio, { color: c.textSecondary }]}>
              {park.ridden}/{park.total}
            </Text>
          </View>
        ) : (
          <>
            <ProgressBar pct={pct} style={styles.barTop} />
            <Text style={[styles.progressLabel, { color: c.textSecondary }]}>
              {park.ridden > 0
                ? `${park.ridden} of ${park.total} credits earned`
                : 'No credits here yet'}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: Radii.card,
    overflow: 'hidden',
    ...Shadows.card,
  },
  hero: {
    height: 110,
  },
  kmPill: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: Brand.blue,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
  },
  kmPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: FontFamily.bold,
  },
  body: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  rating: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
    color: Brand.blue,
  },
  meta: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    marginTop: 3,
  },
  barTop: {
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    marginTop: 5,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  barFlex: {
    flex: 1,
  },
  ratio: {
    fontSize: 11,
    fontFamily: FontFamily.bold,
  },
});
