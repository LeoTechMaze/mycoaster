import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { OnboardingDots } from '@/components/ui/onboarding-dots';
import { PillButton } from '@/components/ui/pill-button';
import { Brand, FontFamily, Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const STEPS = [
  {
    key: 'credits',
    iconBg: Brand.lime,
    iconFg: Brand.navy,
    glyph: '+1',
    title: 'Earn credits',
    caption: 'Mark every coaster you ride. One coaster, one credit — forever yours.',
  },
  {
    key: 'review',
    iconBg: Brand.blue,
    iconFg: '#ffffff',
    glyph: '★',
    title: 'Review & explore',
    caption: 'Rate parks and coasters. AI distills every community review into themes.',
  },
  {
    key: 'ranks',
    iconBg: Brand.navy,
    iconFg: Brand.lime,
    glyph: '▲',
    title: 'Climb the ranks',
    caption: 'From Rookie to Legend — compete with enthusiasts worldwide.',
  },
] as const;

/** Onboarding step 2 — how it works. */
export default function HowItWorksScreen() {
  const c = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <OnboardingDots activeIndex={1} />

        <View style={styles.center}>
          <Text style={[styles.title, { color: c.text }]}>How it works</Text>

          {STEPS.map((step) => (
            <View
              key={step.key}
              style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
            >
              <View style={[styles.iconSquare, { backgroundColor: step.iconBg }]}>
                <Text style={[styles.iconGlyph, { color: step.iconFg }]}>{step.glyph}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: c.text }]}>{step.title}</Text>
                <Text style={[styles.cardCaption, { color: c.textSecondary }]}>{step.caption}</Text>
              </View>
            </View>
          ))}
        </View>

        <PillButton label="Continue" variant="blue" onPress={() => router.push('/login')} />
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
    gap: 14,
  },
  title: {
    fontSize: 30,
    letterSpacing: -1,
    fontFamily: FontFamily.bold,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1.5,
    borderRadius: Radii.panel,
    padding: 16,
  },
  iconSquare: {
    width: 42,
    height: 42,
    borderRadius: Radii.iconSquare,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: FontFamily.bold,
  },
  cardCaption: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
});
