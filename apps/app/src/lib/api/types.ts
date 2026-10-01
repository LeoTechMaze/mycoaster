/**
 * TypeScript types for apps/api's request/response shapes, read directly from
 * apps/api/src/routes/*.ts (not from .specs/docs/api.md, which doesn't
 * capture field names). Keep in sync with those route files until the real
 * schemas move into @mycoaster/shared (deferred — see ROADMAP.md).
 */

export type CoasterStatus = 'operating' | 'sbno' | 'under_construction' | 'defunct';
export type ParkStatus = CoasterStatus;
export type BadgeLevel = 'rookie' | 'enthusiast' | 'veteran' | 'legend';
export type ReviewTargetType = 'coaster' | 'park';
export type Sentiment = 'positive' | 'negative' | 'mixed';

export type AiSummaryTag = {
  label: string;
  mentions: number;
  sentiment: Sentiment;
};

export type AiSummary = {
  summary: string;
  tags: AiSummaryTag[];
  review_count: number;
  generated_at: string;
} | null;

// ─── Users ──────────────────────────────────────────────────────────────────

/** Fields returned by POST /auth/login's `user`. */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  badge_level: BadgeLevel;
  credit_count: number;
  avatar_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
};

/** GET /users/:id — public profile, no email. */
export type PublicUser = {
  id: string;
  name: string;
  badge_level: BadgeLevel;
  credit_count: number;
  avatar_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  created_at: string;
};

/** PATCH /users/me response — PublicUser + email. */
export type OwnUser = PublicUser & { email: string };

export type UpdateUserInput = Partial<{
  name: string;
  avatar_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
}>;

// ─── Parks ──────────────────────────────────────────────────────────────────

export type ParkListItem = {
  id: string;
  name: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  status: ParkStatus;
  ai_summary: AiSummary;
  /** Only present when the list was fetched via lat/lng/radius geo search. */
  distance_km?: number;
};

export type ParkDetail = ParkListItem & {
  synced_at: string;
  avg_rating: number | null;
};

export type ParkCoasterListItem = {
  id: string;
  name: string;
  status: CoasterStatus;
  rcdb_id: string;
  park_id: string;
  ai_summary: AiSummary;
  avg_rating: number | null;
};

export type ParkListQuery =
  | { lat: number; lng: number; radius: number }
  | { country?: string; city?: string };

// ─── Coasters ───────────────────────────────────────────────────────────────

export type CoasterListItem = {
  id: string;
  name: string;
  status: CoasterStatus;
  rcdb_id: string;
  park_id: string;
  ai_summary: AiSummary;
  park_name: string;
  country: string;
  city: string;
  /** Only present when the list was fetched via lat/lng/radius geo search. */
  distance_km?: number;
};

export type CoasterParkEmbed = {
  id: string;
  name: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  status: ParkStatus;
};

export type CoasterDetail = {
  id: string;
  name: string;
  status: CoasterStatus;
  rcdb_id: string;
  park_id: string;
  ai_summary: AiSummary;
  synced_at: string;
  avg_rating: number | null;
  park: CoasterParkEmbed;
};

export type CoasterListQuery =
  | { lat: number; lng: number; radius: number }
  | { country?: string; city?: string };

// ─── Credits ────────────────────────────────────────────────────────────────

export type Credit = {
  id: string;
  coaster_id: string;
  ridden_at: string;
};

export type CreditHistoryItem = Credit & {
  coaster_name: string;
  park_id: string;
  park_name: string;
};

// ─── Reviews ────────────────────────────────────────────────────────────────

export type Review = {
  id: string;
  user_id: string;
  target_type: ReviewTargetType;
  coaster_id: string | null;
  park_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewListItem = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_avatar_url: string | null;
  user_badge_level: BadgeLevel;
};

export type CreateReviewInput =
  | { target_type: 'coaster'; coaster_id: string; rating: number; comment?: string | null }
  | { target_type: 'park'; park_id: string; rating: number; comment?: string | null };

export type UpdateReviewInput = Partial<{
  rating: number;
  comment: string | null;
}>;

export type ListReviewsQuery = {
  limit?: number;
  cursor?: string;
};

export type Paginated<T> = {
  data: T[];
  meta: { limit: number; next_cursor: string | null };
};
