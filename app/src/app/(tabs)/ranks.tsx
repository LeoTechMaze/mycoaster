import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Screen } from '@/components/ui/screen';
import { Brand, FontFamily, Radii } from '@/constants/theme';
import {
  mockPodium,
  mockRankRowsAroundMe,
  mockRankRowsTop,
  type MockRankRow,
} from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

function RankRow({ row }: { row: MockRankRow }) {
  const c = useTheme();
  const me = !!row.me;
  return (
    <View
      style={[
        styles.rankRow,
        { borderBottomColor: c.progressTrack, backgroundColor: me ? c.blueTint : 'transparent' },
      ]}
    >
      <Text style={[styles.rankLabel, { color: me ? Brand.blue : c.textMuted }]}>#{row.rank}</Text>
      <Avatar initial={row.initial} size={34} variant={me ? 'blue' : 'tint'} />
      <View style={styles.rankText}>
        <Text style={[styles.rankName, { color: c.text }]}>{row.name}</Text>
        <Text style={[styles.rankBadge, { color: c.textSecondary }]}>{row.badge}</Text>
      </View>
      <Text style={[styles.rankCredits, { color: me ? Brand.blue : c.text }]}>{row.credits}</Text>
    </View>
  );
}

export default function RanksScreen() {
  const c = useTheme();

  return (
    <Screen gap={14}>
      <Text style={[styles.title, { color: c.text }]}>
        Leaderboard<Text style={styles.titlePeriod}>.</Text>
      </Text>

      {/* Podium */}
      <View style={styles.podiumRow}>
        <View style={[styles.podiumCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Avatar initial={mockPodium.second.initial} size={44} variant="tint" style={styles.podiumAvatar} />
          <Text style={[styles.podiumName, { color: c.text }]}>{mockPodium.second.name}</Text>
          <Text style={[styles.podiumCredits, { color: c.textSecondary }]}>
            {mockPodium.second.credits}
          </Text>
          <Text style={[styles.podiumPlace, { color: c.textMuted }]}>2</Text>
        </View>

        <View style={styles.podiumCardFirst}>
          <Avatar initial={mockPodium.first.initial} size={50} variant="lime" style={styles.podiumAvatar} />
          <Text style={styles.podiumNameFirst}>{mockPodium.first.name}</Text>
          <Text style={styles.podiumCreditsFirst}>{mockPodium.first.credits}</Text>
          <Text style={styles.podiumPlaceFirst}>1</Text>
        </View>

        <View style={[styles.podiumCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Avatar initial={mockPodium.third.initial} size={44} variant="tint" style={styles.podiumAvatar} />
          <Text style={[styles.podiumName, { color: c.text }]}>{mockPodium.third.name}</Text>
          <Text style={[styles.podiumCredits, { color: c.textSecondary }]}>
            {mockPodium.third.credits}
          </Text>
          <Text style={[styles.podiumPlace, { color: c.textMuted }]}>3</Text>
        </View>
      </View>

      {/* Rank list */}
      <View style={[styles.listCard, { backgroundColor: c.card, borderColor: c.border }]}>
        {mockRankRowsTop.map((row) => (
          <RankRow key={row.rank} row={row} />
        ))}

        {/* Gap row between top ranks and the rows around the user */}
        <View style={[styles.rankRow, { borderBottomColor: c.progressTrack }]}>
          <Text style={[styles.rankLabel, { color: c.borderMuted }]}>···</Text>
          <Avatar initial="·" size={34} variant="tint" style={{ backgroundColor: c.progressTrack }} />
          <View style={styles.rankText} />
        </View>

        {mockRankRowsAroundMe.map((row) => (
          <RankRow key={row.rank} row={row} />
        ))}
      </View>

      <Text style={[styles.footer, { color: c.textMuted }]}>Global ranking · updated hourly</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 27,
    letterSpacing: -0.5,
    fontFamily: FontFamily.bold,
  },
  titlePeriod: {
    color: Brand.blue,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  podiumCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: Radii.cardSmall,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  podiumCardFirst: {
    flex: 1.15,
    backgroundColor: Brand.navy,
    borderRadius: Radii.panel,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  podiumAvatar: {
    marginBottom: 8,
  },
  podiumName: {
    fontSize: 12.5,
    lineHeight: 15,
    fontFamily: FontFamily.bold,
    textAlign: 'center',
  },
  podiumNameFirst: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: FontFamily.bold,
    color: '#ffffff',
    textAlign: 'center',
  },
  podiumCredits: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  podiumCreditsFirst: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    color: '#8fa0cc',
    marginTop: 2,
  },
  podiumPlace: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    marginTop: 6,
  },
  podiumPlaceFirst: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: Brand.lime,
    marginTop: 6,
  },
  listCard: {
    borderWidth: 1.5,
    borderRadius: Radii.card,
    overflow: 'hidden',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rankLabel: {
    width: 34,
    fontSize: 13,
    fontFamily: FontFamily.bold,
  },
  rankText: {
    flex: 1,
  },
  rankName: {
    fontSize: 13.5,
    fontFamily: FontFamily.bold,
  },
  rankBadge: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
  },
  rankCredits: {
    fontSize: 13,
    fontFamily: FontFamily.bold,
  },
  footer: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
});
