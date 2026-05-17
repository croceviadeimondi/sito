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

/** Inventario degli slot immagine del sito. Aggiungere qui i nuovi slot. */
export const SLOT = {
  chiSiamoHero: 'chi-siamo/hero',
} as const;

export type Slot = (typeof SLOT)[keyof typeof SLOT];

export interface FotoSlot {
  src: string;
  alt: string;
}

// Cache per-build: la collection viene fetchata una sola volta.
let cache: Map<string, ImmagineSito> | null = null;

async function caricaImmagini(): Promise<Map<string, ImmagineSito>> {
  if (cache) return cache;
  const records = await fetchCollection<ImmagineSito>('immagini_sito', {
    fields: 'chiave,immagine,alt',
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
  fallback: FotoSlot | null = null
): Promise<FotoSlot | null> {
  const mappa = await caricaImmagini();
  const rec = mappa.get(slot);
  const src = assetUrl(rec?.immagine);
  if (!src) return fallback;
  return { src, alt: rec?.alt ?? fallback?.alt ?? '' };
}
