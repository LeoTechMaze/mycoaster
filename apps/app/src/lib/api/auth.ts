import { apiFetch } from './client';
import { clearToken, setToken } from './token';
import type { AuthUser } from './types';

/**
 * Exchanges a Firebase ID token for the api's own JWT (POST /auth/login),
 * stores it, and returns the user record the api created/found.
 */
export async function login(firebaseIdToken: string): Promise<AuthUser> {
  const { token, user } = await apiFetch<{ token: string; user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: { token: firebaseIdToken },
    auth: false, // no JWT exists yet — this call is what obtains one
  });
  await setToken(token);
  return user;
}

export async function logout(): Promise<void> {
  await clearToken();
}
