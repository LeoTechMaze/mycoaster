import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AiSummaryCard } from '@/components/ui/ai-summary-card';
import { BackButton } from '@/components/ui/back-button';
import { PillButton } from '@/components/ui/pill-button';
import { ReviewCard } from '@/components/ui/review-card';
import { StatusPill } from '@/components/ui/status-pill';
import { StripedPlaceholder } from '@/components/ui/striped-placeholder';
import { Brand, FontFamily, Radii, Spacing } from '@/constants/theme';
import { findCoaster } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

export default function CoasterDetailScreen() {
  const c = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { park, coaster } = findCoaster(id);
  const ridden = !!coaster.ridden;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <StripedPlaceholder hueA="#c9d6f5" hueB="#bccbf2" label="coaster photo" style={styles.hero} />

        <View style={styles.content}>
          {/* Title */}
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: c.text }]}>{coaster.name}</Text>
              <Text style={styles.rating}>★ {coaster.rating}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.parkName, { color: c.textSecondary }]}>{park.name}</Text>
              <View style={[styles.typePill, { backgroundColor: c.blueTint }]}>
                <Text style={styles.typePillText}>{coaster.type}</Text>
              </View>
              <StatusPill status={coaster.status} />
            </View>
          </View>

          {/* Ride CTA — static state from mock data */}
          {ridden ? (
            <PillButton
              label="✓ Ridden — in your credits (tap to undo)"
              variant="white"
              withShadow={false}
              style={styles.riddenCta}
            />
          ) : (
            <PillButton label="Mark as ridden · +1 credit" variant="lime" />
          )}

          {/* "Write a review" appears ONLY after the coaster is marked ridden */}
          {ridden ? (
            <PillButton
              label="Write a review"
              variant="navy"
              onPress={() => router.push('/review-composer')}
            />
          ) : null}

          {/* AI summary — only when data exists */}
          {coaster.ai ? <AiSummaryCard ai={coaster.ai} /> : null}

          <View style={styles.stack10}>
            {(coaster.reviews ?? []).map((review) => (
              <ReviewCard key={review.user} review={review} />
            ))}
          </View>
        </View>
      </ScrollView>

      <BackButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    height: 190,
  },
  content: {
    paddingTop: 18,
    paddingHorizontal: Spacing.screenX,
    paddingBottom: 28,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    letterSpacing: -0.5,
    fontFamily: FontFamily.bold,
    flexShrink: 1,
  },
  rating: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    color: Brand.blue,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  parkName: {
    fontSize: 12.5,
    fontFamily: FontFamily.regular,
  },
  typePill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radii.pill,
  },
  typePillText: {
    fontSize: 10,
    fontFamily: FontFamily.bold,
    color: Brand.blue,
  },
  riddenCta: {
    borderWidth: 2,
    borderColor: Brand.lime,
  },
  stack10: {
    gap: 10,
  },
});
