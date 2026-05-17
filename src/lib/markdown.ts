/*
 * Conversione markdown per i contenuti che arrivano da Directus.
 * Tutto al build time: nessun JS markdown sul client.
 */
import { marked } from 'marked';

/**
 * Markdown inline → HTML: solo formattazione inline (grassetto, corsivo,
 * link, codice). Niente blocchi (titoli, liste, paragrafi): il risultato
 * è inseribile dentro un <p> esistente senza HTML annidato non valido.
 */
export function mdInline(testo: string | null | undefined): string {
  if (!testo) return '';
  return marked.parseInline(testo.trim()) as string;
}

/**
 * Markdown → testo piatto, senza sintassi né tag.
 * Per i punti dove serve testo puro: <meta description>, tag social, sommari.
 */
export function mdPlain(testo: string | null | undefined): string {
  if (!testo) return '';
  const html = marked.parseInline(testo.trim()) as string;
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
