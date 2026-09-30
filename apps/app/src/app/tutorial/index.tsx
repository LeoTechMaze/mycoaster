import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

import { OnboardingDots } from '@/components/ui/onboarding-dots';
import { PillButton } from '@/components/ui/pill-button';
import { Brand, FontFamily } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Onboarding step 1 — the hook. */
export default function TutorialHookScreen() {
  const c = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <OnboardingDots activeIndex={0} />

        <View style={styles.center}>
          <Svg width="100%" height={70} viewBox="0 0 330 70" preserveAspectRatio="none">
            <Path
              d="M0,58 Q70,-18 150,40 T330,18"
              fill="none"
              stroke={Brand.blue}
              strokeWidth={4}
              strokeDasharray="9 8"
              strokeLinecap="round"
            />
            <Circle cx={122} cy={26} r={9} fill={Brand.lime} stroke={Brand.navy} strokeWidth={3} />
          </Svg>

          <Text style={[styles.headline, { color: c.text }]}>
            Every ride.{'\n'}Counted<Text style={styles.headlinePeriod}>.</Text>
          </Text>

          <Text style={[styles.subCopy, { color: c.textSecondary }]}>
            MyCoaster is the digital home for coaster enthusiasts — track your credits, review
            parks, and climb the global leaderboard.
          </Text>
        </View>

        <PillButton label="Continue" variant="blue" onPress={() => router.push('/tutorial/howitworks')} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  headline: {
    fontSize: 42,
    lineHeight: 44,
    letterSpacing: -1.5,
    fontFamily: FontFamily.bold,
  },
  headlinePeriod: {
    color: Brand.blue,
  },
  subCopy: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: FontFamily.regular,
    maxWidth: 280,
  },
});
