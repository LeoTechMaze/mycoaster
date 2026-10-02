import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { OnboardingDots } from '@/components/ui/onboarding-dots';
import { PillButton } from '@/components/ui/pill-button';
import { Brand, FontFamily } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

/** Onboarding step 3 — auth. */
export default function LoginScreen() {
  const c = useTheme();
  const router = useRouter();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const enterApp = () => router.replace('/');

  const withErrorHandling = (signIn: () => Promise<void>) => async () => {
    setError(null);
    setPending(true);
    try {
      await signIn();
      enterApp();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <OnboardingDots activeIndex={2} />

        <View style={styles.center}>
          <Text style={[styles.title, { color: c.text }]}>
            Hop on<Text style={styles.titlePeriod}>.</Text>
          </Text>

          <PillButton
            label="Continue with Google"
            variant="white"
            withShadow={false}
            leading={<Text style={styles.googleG}>G</Text>}
            disabled={pending}
            onPress={withErrorHandling(signInWithGoogle)}
          />
          <PillButton
            label="Continue with Apple"
            variant="navy"
            leading={<Text style={styles.appleGlyph}></Text>}
            disabled={pending}
            onPress={withErrorHandling(signInWithApple)}
          />
          <PillButton
            label="Sign up with email"
            variant="outline"
            disabled={pending}
            onPress={() => router.push('/login/email')}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={[styles.legal, { color: c.textMuted }]}>
            By continuing you agree to our Terms & Privacy Policy.
          </Text>
        </View>
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
    gap: 12,
  },
  title: {
    fontSize: 30,
    letterSpacing: -1,
    fontFamily: FontFamily.bold,
    marginBottom: 14,
  },
  titlePeriod: {
    color: Brand.blue,
  },
  googleG: {
    color: Brand.blue,
    fontSize: 14.5,
    fontFamily: FontFamily.bold,
  },
  appleGlyph: {
    color: '#ffffff',
    fontSize: 15,
  },
  error: {
    fontSize: 12.5,
    fontFamily: FontFamily.regular,
    color: '#d14343',
    textAlign: 'center',
    marginTop: 4,
  },
  legal: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    marginTop: 10,
  },
});
