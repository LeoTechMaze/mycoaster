import { apiFetchPaginated, apiFetch } from './client';
import type {
  CreateReviewInput,
  ListReviewsQuery,
  Review,
  ReviewListItem,
  UpdateReviewInput,
} from './types';

/** POST /reviews — create a review for a coaster or a park. */
export function create(input: CreateReviewInput): Promise<Review> {
  return apiFetch<Review>('/reviews', { method: 'POST', body: input });
}

/** PUT /reviews/:id — update your own review's rating and/or comment. */
export function update(id: string, input: UpdateReviewInput): Promise<Review> {
  return apiFetch<Review>(`/reviews/${id}`, { method: 'PUT', body: input });
}

/** GET /reviews/coaster/:id — cursor-paginated reviews for a coaster. */
export function listForCoaster(id: string, query: ListReviewsQuery = {}) {
  return apiFetchPaginated<ReviewListItem[]>(`/reviews/coaster/${id}`, { query });
}

/** GET /reviews/park/:id — cursor-paginated reviews for a park. */
export function listForPark(id: string, query: ListReviewsQuery = {}) {
  return apiFetchPaginated<ReviewListItem[]>(`/reviews/park/${id}`, { query });
}
