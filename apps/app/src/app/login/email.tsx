import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PillButton } from '@/components/ui/pill-button';
import { FontFamily, Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

/** Email/password sign-in or sign-up, reached from the login screen's "Sign up with email". */
export default function EmailAuthScreen() {
  const c = useTheme();
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setError(null);
    setPending(true);
    try {
      if (mode === 'signUp') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()}>
          <Text style={[styles.back, { color: c.text }]}>← Back</Text>
        </Pressable>

        <View style={styles.center}>
          <Text style={[styles.title, { color: c.text }]}>
            {mode === 'signUp' ? 'Create account' : 'Welcome back'}
          </Text>

          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={c.textMuted}
            value={email}
            onChangeText={setEmail}
            style={[styles.input, { backgroundColor: c.progressTrack, borderColor: c.border, color: c.text }]}
          />
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            secureTextEntry
            placeholder="Password"
            placeholderTextColor={c.textMuted}
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { backgroundColor: c.progressTrack, borderColor: c.border, color: c.text }]}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <PillButton
            label={mode === 'signUp' ? 'Create account' : 'Sign in'}
            variant={pending || !email || !password ? 'disabled' : 'blue'}
            disabled={pending || !email || !password}
            onPress={submit}
            style={styles.submit}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => setMode(mode === 'signUp' ? 'signIn' : 'signUp')}
          >
            <Text style={[styles.toggle, { color: c.textSecondary }]}>
              {mode === 'signUp' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Text>
          </Pressable>
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
  back: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 26,
    letterSpacing: -1,
    fontFamily: FontFamily.bold,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Radii.photoTile,
    paddingVertical: 13,
    paddingHorizontal: 15,
    fontSize: 14,
    fontFamily: FontFamily.regular,
  },
  error: {
    fontSize: 12.5,
    fontFamily: FontFamily.regular,
    color: '#d14343',
    textAlign: 'center',
  },
  submit: {
    marginTop: 8,
  },
  toggle: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    marginTop: 4,
  },
});
