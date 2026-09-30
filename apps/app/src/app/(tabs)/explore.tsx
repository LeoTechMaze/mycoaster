import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ParkCard } from '@/components/ui/park-card';
import { Screen } from '@/components/ui/screen';
import { SearchBar } from '@/components/ui/search-bar';
import { Brand, FontFamily, Radii } from '@/constants/theme';
import { mockParks } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

const CHIPS = ['Nearby', 'Top rated', 'Unridden'];

export default function ExploreScreen() {
  const c = useTheme();
  const router = useRouter();

  return (
    <Screen gap={14}>
      <Text style={[styles.title, { color: c.text }]}>
        Explore<Text style={styles.titlePeriod}>.</Text>
      </Text>

      <SearchBar />

      {/* Filter chips — layout only; "Nearby" shown selected */}
      <View style={styles.chipsRow}>
        {CHIPS.map((label, i) => {
          const selected = i === 0;
          return (
            <View
              key={label}
              style={[
                styles.chip,
                selected
                  ? styles.chipSelected
                  : { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <Text
                style={[
                  selected ? styles.chipTextSelected : styles.chipText,
                  !selected && { color: c.textSecondary },
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.cardList}>
        {mockParks.map((park) => (
          <ParkCard
            key={park.id}
            park={park}
            variant="explore"
            onPress={() => router.push(`/park/${park.id}`)}
          />
        ))}
      </View>
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
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: Radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  chipSelected: {
    backgroundColor: Brand.lime,
    borderColor: Brand.lime,
  },
  chipText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  chipTextSelected: {
    fontSize: 12,
    fontFamily: FontFamily.bold,
    color: Brand.navy,
  },
  cardList: {
    gap: 12,
  },
});
