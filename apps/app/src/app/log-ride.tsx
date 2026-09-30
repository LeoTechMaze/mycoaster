import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/ui/sheet';
import { Brand, FontFamily, Radii } from '@/constants/theme';
import { mockLogList } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

/** "Log a ride" bottom sheet — layout only, static list. */
export default function LogRideSheet() {
  const c = useTheme();

  return (
    <Sheet title="Log a ride" subtitle="Unridden coasters near you">
      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        <View style={styles.rows}>
          {mockLogList.map((item) => (
            <View
              key={item.name}
              style={[styles.row, { backgroundColor: c.progressTrack }]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.rowName, { color: c.text }]}>{item.name}</Text>
                <Text style={[styles.rowPark, { color: c.textSecondary }]}>{item.park}</Text>
              </View>
              <View style={styles.creditPill}>
                <Text style={styles.creditPillText}>+ Credit</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 14,
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radii.photoTile,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: 13.5,
    fontFamily: FontFamily.bold,
  },
  rowPark: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
  },
  creditPill: {
    backgroundColor: Brand.lime,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
  },
  creditPillText: {
    fontSize: 12,
    fontFamily: FontFamily.bold,
    color: Brand.navy,
  },
});
