/*
 * Client Directus per build-time fetch.
 * Tutte le chiamate avvengono durante `astro build`, mai a runtime sul client.
 * Se il CMS è irraggiungibile, le funzioni restituiscono [] / null così la pagina
 * renderizza comunque lo stato vuoto invece di rompere il build.
 */

const DIRECTUS_URL =
  import.meta.env.DIRECTUS_URL ?? 'https://cms.croceviadeimondi.org';

export interface FetchOptions {
  fields?: string;
  filter?: Record<string, unknown>;
  sort?: string;
  limit?: number;
}

function appendFiltro(params: URLSearchParams, chiave: string, valore: unknown): void {
  if (valore !== null && typeof valore === 'object' && !Array.isArray(valore)) {
    for (const [k, v] of Object.entries(valore as Record<string, unknown>)) {
      appendFiltro(params, `${chiave}[${k}]`, v);
    }
  } else {
    params.set(chiave, String(valore));
  }
}

function buildQuery(opts: FetchOptions, filtroPubblicato: boolean): string {
  const params = new URLSearchParams();
  if (filtroPubblicato) params.set('filter[status][_eq]', 'published');
  if (opts.fields) params.set('fields', opts.fields);
  if (opts.sort) params.set('sort', opts.sort);
  if (typeof opts.limit === 'number') params.set('limit', String(opts.limit));
  if (opts.filter) {
    for (const [k, v] of Object.entries(opts.filter)) {
      appendFiltro(params, `filter[${k}]`, v);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchCollection<T>(
  collection: string,
  opts: FetchOptions = {}
): Promise<T[]> {
  const url = `${DIRECTUS_URL}/items/${collection}${buildQuery(opts, true)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[directus] ${collection}: HTTP ${res.status}`);
      return [];
    }
    const json = (await res.json()) as { data?: T[] };
    return json.data ?? [];
  } catch (err) {
    console.warn(`[directus] ${collection}: fetch failed`, err);
    return [];
  }
}

export async function fetchSingleton<T>(collection: string): Promise<T | null> {
  const url = `${DIRECTUS_URL}/items/${collection}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export function assetUrl(fileId: string | null | undefined): string | null {
  if (!fileId) return null;
  return `${DIRECTUS_URL}/assets/${fileId}`;
}
