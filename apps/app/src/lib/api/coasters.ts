import { apiFetch } from './client';
import type { CoasterDetail, CoasterListItem, CoasterListQuery } from './types';

/** GET /coasters — geo search (lat+lng+radius) or text search (country/city). */
export function list(query: CoasterListQuery): Promise<CoasterListItem[]> {
  return apiFetch<CoasterListItem[]>('/coasters', { query });
}

/** GET /coasters/:id — detail, including avg_rating and the embedded park. */
export function get(id: string): Promise<CoasterDetail> {
  return apiFetch<CoasterDetail>(`/coasters/${id}`);
}
