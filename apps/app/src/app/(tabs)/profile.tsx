import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { Brand, FontFamily, Radii } from '@/constants/theme';
import { mockRecentCredits, mockUser } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

const SOCIALS = ['Instagram', 'TikTok', 'YouTube'];

export default function ProfileScreen() {
  const c = useTheme();
  const router = useRouter();

  const stats = [
    { value: String(mockUser.credits), label: 'CREDITS', blue: true },
    { value: String(mockUser.parksVisited), label: 'PARKS VISITED' },
    { value: String(mockUser.reviews), label: 'REVIEWS' },
    { value: String(mockUser.photosShared), label: 'PHOTOS SHARED' },
  ];

  return (
    <Screen gap={14}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Avatar initial={mockUser.initial} size={64} variant="blue" />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: c.text }]}>{mockUser.name}</Text>
            {mockUser.isPremium ? (
              <View style={styles.proPill}>
                <Text style={styles.proPillText}>PRO</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{mockUser.badge}</Text>
            </View>
            <Text style={[styles.rankLabel, { color: c.textSecondary }]}>
              #{mockUser.rank} global
            </Text>
          </View>
        </View>
      </View>

      {/* Socials */}
      <View style={styles.socialsRow}>
        {SOCIALS.map((label) => (
          <View key={label} style={[styles.socialPill, { backgroundColor: c.blueTint }]}>
            <Text style={styles.socialPillText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* 2×2 stat grid */}
      <View style={styles.statGrid}>
        {stats.map((stat) => (
          <View
            key={stat.label}
            style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <Text style={[styles.statNumber, { color: stat.blue ? Brand.blue : c.text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Road to next badge */}
      <View style={styles.roadCard}>
        <View style={styles.roadHeadRow}>
          <Text style={styles.roadTitle}>Road to {mockUser.nextBadge}</Text>
          <Text style={styles.roadToGo}>{mockUser.creditsToNextBadge} credits to go</Text>
        </View>
        <ProgressBar
          pct={mockUser.badgeProgressPct}
          trackColor="rgba(255,255,255,.14)"
          fillColor={Brand.lime}
          style={styles.roadBar}
        />
        <View style={styles.roadRangeRow}>
          <Text style={styles.roadRangeLabel}>{mockUser.badge}</Text>
          <Text style={styles.roadRangeLabel}>
            {mockUser.nextBadge} · {mockUser.nextBadgeAt}
          </Text>
        </View>
      </View>

      {/* Recent credits */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Recent credits</Text>
      <View style={[styles.listCard, { backgroundColor: c.card, borderColor: c.border }]}>
        {mockRecentCredits.map((credit) => (
          <View
            key={credit.name}
            style={[styles.creditRow, { borderBottomColor: c.progressTrack }]}
          >
            <View style={[styles.creditIcon, { backgroundColor: c.blueTint }]}>
              <Text style={styles.creditIconText}>+1</Text>
            </View>
            <View style={styles.creditText}>
              <Text style={[styles.creditName, { color: c.text }]}>{credit.name}</Text>
              <Text style={[styles.creditPark, { color: c.textSecondary }]}>{credit.park}</Text>
            </View>
            <Text style={[styles.creditWhen, { color: c.textMuted }]}>{credit.when}</Text>
          </View>
        ))}
      </View>

      {/* Sign out */}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/tutorial')}
        style={styles.signOut}
      >
        <Text style={[styles.signOutText, { color: c.textMuted }]}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 21,
    fontFamily: FontFamily.bold,
  },
  proPill: {
    backgroundColor: Brand.navy,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radii.pill,
  },
  proPillText: {
    color: Brand.lime,
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: FontFamily.bold,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  badgePill: {
    backgroundColor: Brand.lime,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: Radii.pill,
  },
  badgePillText: {
    color: Brand.navy,
    fontSize: 11,
    fontFamily: FontFamily.bold,
  },
  rankLabel: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
  socialsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  socialPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
  },
  socialPillText: {
    fontSize: 11.5,
    fontFamily: FontFamily.bold,
    color: Brand.blue,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderRadius: Radii.cardSmall,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 26,
    lineHeight: 28,
    fontFamily: FontFamily.bold,
  },
  statLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    fontFamily: FontFamily.regular,
    marginTop: 4,
  },
  roadCard: {
    backgroundColor: Brand.navy,
    borderRadius: Radii.card,
    padding: 18,
  },
  roadHeadRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  roadTitle: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    color: '#ffffff',
  },
  roadToGo: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    color: '#8fa0cc',
  },
  roadBar: {
    marginTop: 12,
  },
  roadRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  roadRangeLabel: {
    fontSize: 10.5,
    fontFamily: FontFamily.regular,
    color: '#8fa0cc',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    marginTop: 4,
  },
  listCard: {
    borderWidth: 1.5,
    borderRadius: Radii.card,
    overflow: 'hidden',
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  creditIcon: {
    width: 36,
    height: 36,
    borderRadius: Radii.iconSquare,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditIconText: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
    color: Brand.blue,
  },
  creditText: {
    flex: 1,
  },
  creditName: {
    fontSize: 13.5,
    fontFamily: FontFamily.bold,
  },
  creditPark: {
    fontSize: 11.5,
    fontFamily: FontFamily.regular,
  },
  creditWhen: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
  },
  signOut: {
    alignItems: 'center',
    padding: 10,
  },
  signOutText: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
  },
});
