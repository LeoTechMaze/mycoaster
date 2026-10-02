import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';

let configured = false;

function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
  configured = true;
}

/**
 * Google Sign-In → Firebase credential exchange. Throws if the user cancels
 * (GoogleSignin.signIn() resolves to a 'cancelled' response rather than
 * rejecting, so callers can't distinguish cancel from error without this).
 */
export async function signInWithGoogle() {
  ensureConfigured();
  await GoogleSignin.hasPlayServices();

  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    throw new Error('Google sign-in was cancelled');
  }

  const { idToken } = response.data;
  if (!idToken) {
    throw new Error('Google sign-in did not return an id token');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(getAuth(), credential);
}
