import { apiFetch } from './client';
import type { ParkCoasterListItem, ParkDetail, ParkListItem, ParkListQuery } from './types';

/** GET /parks — geo search (lat+lng+radius) or text search (country/city). */
export function list(query: ParkListQuery): Promise<ParkListItem[]> {
  return apiFetch<ParkListItem[]>('/parks', { query });
}

/** GET /parks/:id — detail, including avg_rating. */
export function get(id: string): Promise<ParkDetail> {
  return apiFetch<ParkDetail>(`/parks/${id}`);
}

/** GET /parks/:id/coasters — coasters belonging to a park. */
export function coasters(id: string): Promise<ParkCoasterListItem[]> {
  return apiFetch<ParkCoasterListItem[]>(`/parks/${id}/coasters`);
}
