import { API_URL } from './config';
import { getToken } from './token';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: Method;
  body?: unknown;
  query?: Record<string, unknown>;
  /** Attach the stored JWT as a Bearer token. Defaults to true. */
  auth?: boolean;
};

type Envelope<T> = { data: T; meta?: { limit: number; next_cursor: string | null } };
type ErrorEnvelope = { error: string };

async function send<T>(path: string, options: RequestOptions): Promise<Envelope<T> | undefined> {
  const { method = 'GET', body, query, auth = true } = options;

  const url = new URL(path, API_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined;

  const json: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json && typeof json === 'object' && 'error' in json
        ? String((json as ErrorEnvelope).error)
        : res.statusText || `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return json as Envelope<T>;
}

/** Most endpoints: returns the response's `data` field directly, or `undefined` for a 204. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const envelope = await send<T>(path, options);
  return envelope?.data as T;
}

/** Paginated endpoints (reviews listings): returns both `data` and `meta`. */
export async function apiFetchPaginated<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; meta: { limit: number; next_cursor: string | null } }> {
  const envelope = await send<T>(path, options);
  if (!envelope || !envelope.meta) {
    throw new ApiError(500, `Expected a paginated response from ${path}`);
  }
  return { data: envelope.data, meta: envelope.meta };
}
