import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth as apiAuth } from '@/lib/api';
import type { AuthUser } from '@/lib/api/types';

import { signInWithApple as appleSignIn } from './apple';
import { signInWithGoogle as googleSignIn } from './google';

type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Firebase persists its own session across app restarts, so this fires
    // with the restored user (if any) on boot — exchanging for a fresh api
    // JWT every time keeps the two in sync without separately persisting
    // AuthUser ourselves (there's no GET /users/me to refetch it from later).
    return onAuthStateChanged(getAuth(), async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const apiUser = await apiAuth.login(idToken);
        setUser(apiUser);
        setStatus('signedIn');
      } else {
        await apiAuth.logout();
        setUser(null);
        setStatus('signedOut');
      }
    });
  }, []);

  // Each sign-in method only needs to produce a Firebase credential —
  // onAuthStateChanged above does the api JWT exchange for all of them.
  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getAuth(), email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(getAuth(), email, password);
  };

  const signInWithGoogle = async () => {
    await googleSignIn();
  };

  const signInWithApple = async () => {
    await appleSignIn();
  };

  const signOut = async () => {
    await firebaseSignOut(getAuth());
  };

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, signOut }),
    [status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
