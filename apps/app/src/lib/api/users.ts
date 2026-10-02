import { apiFetch } from './client';
import type { OwnUser, PublicUser, UpdateUserInput } from './types';

/** GET /users/:id — public profile, works for any user id including your own. */
export function get(id: string): Promise<PublicUser> {
  return apiFetch<PublicUser>(`/users/${id}`);
}

/** PATCH /users/me — update the signed-in user's own profile. */
export function updateMe(input: UpdateUserInput): Promise<OwnUser> {
  return apiFetch<OwnUser>('/users/me', { method: 'PATCH', body: input });
}
