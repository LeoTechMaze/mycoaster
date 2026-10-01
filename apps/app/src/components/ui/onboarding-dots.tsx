import { StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Progress dots top-left of onboarding: active = 26×6 blue pill, inactive = 10×6. */
export function OnboardingDots({ activeIndex, count = 3 }: { activeIndex: number; count?: number }) {
  const c = useTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === activeIndex
              ? { width: 26, backgroundColor: Brand.blue }
              : { width: 10, backgroundColor: c.starEmpty },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
