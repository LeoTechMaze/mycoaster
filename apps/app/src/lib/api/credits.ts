import { apiFetch } from './client';
import type { Credit, CreditHistoryItem } from './types';

/** POST /credits — mark a coaster as ridden. */
export function add(coasterId: string): Promise<Credit> {
  return apiFetch<Credit>('/credits', { method: 'POST', body: { coaster_id: coasterId } });
}

/** DELETE /credits/:coaster_id — unmark a coaster as ridden. Returns nothing (204). */
export function remove(coasterId: string): Promise<void> {
  return apiFetch<void>(`/credits/${coasterId}`, { method: 'DELETE' });
}

/** GET /credits/me — the signed-in user's full credit history. */
export function me(): Promise<CreditHistoryItem[]> {
  return apiFetch<CreditHistoryItem[]>('/credits/me');
}
