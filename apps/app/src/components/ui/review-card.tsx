import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Brand, FontFamily, Radii } from '@/constants/theme';
import type { MockReview } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

export function ReviewCard({ review }: { review: MockReview }) {
  const c = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.headRow}>
        <Avatar initial={review.user[0]} size={34} variant="tint" />
        <View style={styles.headText}>
          <View style={styles.nameRow}>
            <Text style={[styles.user, { color: c.text }]}>{review.user}</Text>
            <View style={[styles.badge, { backgroundColor: c.progressTrack }]}>
              <Text style={[styles.badgeText, { color: c.textSecondary }]}>{review.badge}</Text>
            </View>
          </View>
          <Text style={[styles.date, { color: c.textMuted }]}>{review.date}</Text>
        </View>
        <Text style={styles.stars}>{review.stars}</Text>
      </View>
      <Text style={[styles.body, { color: c.textBody }]}>{review.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: Radii.cardSmall,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  user: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: Radii.pill,
  },
  badgeText: {
    fontSize: 9.5,
    fontFamily: FontFamily.bold,
  },
  date: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
  },
  stars: {
    fontSize: 12.5,
    fontFamily: FontFamily.bold,
    color: Brand.blue,
  },
  body: {
    fontSize: 12.5,
    lineHeight: 19,
    fontFamily: FontFamily.regular,
    marginTop: 10,
  },
});
