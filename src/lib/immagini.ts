/*
 * Immagini editoriali/decorative del sito.
 *
 * Le foto vivono nella collection Directus `immagini_sito`, una per "slot".
 * Lo slot è identificato da una `chiave` stabile: è il contratto tra codice
 * e CMS. Il codice conosce le chiavi qui sotto; l'admin Directus sostituisce
 * solo il file e l'alt text del relativo record.
 *
 * Se uno slot non ha record/immagine, o il CMS è irraggiungibile al build,
 * `immagine()` restituisce il `fallback` passato dalla pagina (o null).
 */
import { fetchCollection, assetUrl } from './directus';
import type { ImmagineSito } from './types';

/**
 * Slot immagine noti. Le pagine attività usano chiavi dinamiche
 * `attivita/<slug>` costruite a runtime, quindi non sono elencate qui.
 */
export const SLOT = {
  chiSiamoHero: 'chi-siamo/hero',
  chiSiamoScuole: 'chi-siamo/scuole',
  contattiHero: 'contatti/hero',
  eventiHero: 'eventi/hero',
} as const;

/** Una chiave nota, oppure una costruita a runtime (es. `attivita/<slug>`). */
export type Slot = (typeof SLOT)[keyof typeof SLOT] | (string & {});

export interface FotoSlot {
  src: string;
  alt: string;
}

export interface OpzioniImmagine {
  /**
   * Larghezza max in px. Se valorizzata, Directus serve una versione
   * ridotta in WebP (l'originale caricato può restare pesante).
   * Ignorata sulle immagini di fallback statiche.
   */
  larghezza?: number;
}

// Cache per-build: la collection viene fetchata una sola volta.
let cache: Map<string, ImmagineSito> | null = null;

async function caricaImmagini(): Promise<Map<string, ImmagineSito>> {
  if (cache) return cache;
  const records = await fetchCollection<ImmagineSito>('immagini_sito', {
    fields: 'chiave,immagine,alt',
    limit: -1,
  });
  cache = new Map(records.map((r) => [r.chiave, r]));
  return cache;
}

/**
 * Restituisce src + alt dello slot richiesto.
 * Ritorna `fallback` (default null) se lo slot non esiste, non ha immagine
 * o il CMS è giù: la pagina chiamante decide se nascondere la figure.
 */
export async function immagine(
  slot: Slot,
  fallback: FotoSlot | null = null,
  opzioni: OpzioniImmagine = {}
): Promise<FotoSlot | null> {
  const mappa = await caricaImmagini();
  const rec = mappa.get(slot);
  const base = assetUrl(rec?.immagine);
  if (base) {
    const src = opzioni.larghezza
      ? `${base}?width=${opzioni.larghezza}&format=webp&quality=82`
      : base;
    return { src, alt: rec?.alt ?? fallback?.alt ?? '' };
  }
  return fallback;
}
