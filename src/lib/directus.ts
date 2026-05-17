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
  /** Se false, NON aggiunge il filtro status=published (per collection senza status). Default true. */
  pubblicato?: boolean;
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

// Cache per-process: la stessa URL viene fetchata una sola volta per build.
// Evita rate-limit Directus (FooterMain ecc. pescano sedi/impostazioni in ogni pagina).
const cacheFetch = new Map<string, unknown>();

// Retry con backoff per il caso 429: il rate limiter di Directus colpisce
// quando i build sono ravvicinati. Ritentare lascia che la finestra si svuoti.
async function fetchConRetry(url: string, collection: string): Promise<Response | null> {
  const MAX_TENTATIVI = 4;
  let ultimaResposta: Response | null = null;
  for (let i = 0; i < MAX_TENTATIVI; i++) {
    const res = await fetch(url);
    if (res.status !== 429) return res;
    ultimaResposta = res;
    const attesa = 500 * Math.pow(2, i); // 500ms, 1s, 2s, 4s
    console.warn(`[directus] ${collection}: 429, riprovo tra ${attesa}ms (tentativo ${i + 1}/${MAX_TENTATIVI})`);
    await new Promise((r) => setTimeout(r, attesa));
  }
  return ultimaResposta;
}

export async function fetchCollection<T>(
  collection: string,
  opts: FetchOptions = {}
): Promise<T[]> {
  const filtroPubblicato = opts.pubblicato !== false;
  const url = `${DIRECTUS_URL}/items/${collection}${buildQuery(opts, filtroPubblicato)}`;
  if (cacheFetch.has(url)) return cacheFetch.get(url) as T[];
  try {
    const res = await fetchConRetry(url, collection);
    if (!res || !res.ok) {
      console.warn(`[directus] ${collection}: HTTP ${res?.status ?? 'no response'}`);
      return [];
    }
    const json = (await res.json()) as { data?: T[] };
    const data = json.data ?? [];
    cacheFetch.set(url, data);
    return data;
  } catch (err) {
    console.warn(`[directus] ${collection}: fetch failed`, err);
    return [];
  }
}

export async function fetchSingleton<T>(collection: string): Promise<T | null> {
  const url = `${DIRECTUS_URL}/items/${collection}`;
  if (cacheFetch.has(url)) return cacheFetch.get(url) as T | null;
  try {
    const res = await fetchConRetry(url, collection);
    if (!res || !res.ok) return null;
    const json = (await res.json()) as { data?: T };
    const data = json.data ?? null;
    cacheFetch.set(url, data);
    return data;
  } catch {
    return null;
  }
}

export function assetUrl(fileId: string | null | undefined): string | null {
  if (!fileId) return null;
  return `${DIRECTUS_URL}/assets/${fileId}`;
}
