import { OAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

/**
 * Apple Sign-In → Firebase credential exchange. The raw nonce is generated
 * here and passed unhashed to Firebase's credential; Apple only ever sees
 * its SHA-256 digest (standard replay-protection pattern — Apple's own docs
 * and Firebase's OAuthCredentialOptions both expect this split).
 */
export async function signInWithApple() {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!appleCredential.identityToken) {
    throw new Error('Apple sign-in did not return an identity token');
  }

  const firebaseCredential = new OAuthProvider('apple.com').credential({
    idToken: appleCredential.identityToken,
    rawNonce,
  });

  return signInWithCredential(getAuth(), firebaseCredential);
}
