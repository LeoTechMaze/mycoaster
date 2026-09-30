import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/avatar';
import { ParkCard } from '@/components/ui/park-card';
import { Screen } from '@/components/ui/screen';
import { SearchBar } from '@/components/ui/search-bar';
import { Brand, FontFamily, Radii } from '@/constants/theme';
import { mockParks, mockUser } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const c = useTheme();
  const router = useRouter();
  const nearbyParks = mockParks.slice(0, 3);

  return (
    <Screen gap={16}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: c.textSecondary }]}>
            Good morning, {mockUser.name}
          </Text>
          <Text style={[styles.headline, { color: c.text }]}>
            Find your next ride<Text style={styles.headlinePeriod}>.</Text>
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/profile')}>
          <Avatar initial={mockUser.initial} size={46} variant="blue" />
        </Pressable>
      </View>

      {/* Stats card */}
      <View style={styles.statsCard}>
        <View style={styles.decorRing} />
        <View style={styles.statCol}>
          <Text style={[styles.statNumber, styles.statNumberLime]}>{mockUser.credits}</Text>
          <Text style={styles.statLabel}>CREDITS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statNumber}>#{mockUser.rank}</Text>
          <Text style={styles.statLabel}>GLOBAL</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statNumber}>{mockUser.parksVisited}</Text>
          <Text style={styles.statLabel}>PARKS</Text>
        </View>
      </View>

      {/* Search pseudo-input */}
      <SearchBar onPress={() => router.push('/explore')} />

      {/* Parks near you */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Parks near you</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/explore')} hitSlop={8}>
          <Text style={styles.seeAll}>See all →</Text>
        </Pressable>
      </View>

      <View style={styles.cardList}>
        {nearbyParks.map((park) => (
          <ParkCard
            key={park.id}
            park={park}
            variant="home"
            onPress={() => router.push(`/park/${park.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
  },
  headline: {
    fontSize: 27,
    letterSpacing: -0.5,
    fontFamily: FontFamily.bold,
  },
  headlinePeriod: {
    color: Brand.blue,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Brand.blue,
    borderRadius: Radii.card,
    padding: 18,
    overflow: 'hidden',
  },
  decorRing: {
    position: 'absolute',
    right: -30,
    top: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 22,
    borderColor: 'rgba(200,240,74,.18)',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    lineHeight: 34,
    fontFamily: FontFamily.bold,
    color: '#ffffff',
  },
  statNumberLime: {
    color: Brand.lime,
  },
  statLabel: {
    fontSize: 10.5,
    letterSpacing: 1,
    fontFamily: FontFamily.regular,
    color: 'rgba(255,255,255,.75)',
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,.25)',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
  },
  seeAll: {
    fontSize: 12,
    fontFamily: FontFamily.bold,
    color: Brand.blue,
  },
  cardList: {
    gap: 12,
  },
});
