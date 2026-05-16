export type Status = 'published' | 'draft' | 'archived';

export type SubBrand = 'crocevia' | 'grafite' | 'righe' | (string & {});
export type StatoProgetto =
  | 'in_corso'
  | 'concluso'
  | 'in_pausa'
  | 'futuro'
  | (string & {});
export type Ricorrenza =
  | 'una_tantum'
  | 'settimanale'
  | 'mensile'
  | (string & {});

export interface Impostazioni {
  id: string;
  denominazione_completa: string | null;
  denominazione_breve: string | null;
  sigla_giuridica: string | null;
  codice_fiscale: string | null;
  partita_iva: string | null;
  numero_runts: string | null;
  email_principale: string | null;
  telefono: string | null;
  iban_donazioni: string | null;
  intestatario_iban: string | null;
  satispay_charity_url: string | null;
  messaggio_donazioni: string | null;
  instagram_handle: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  tagline: string | null;
  logo_principale: string | null;
  logo_chiaro: string | null;
  favicon: string | null;
  testo_footer: string | null;
}

export interface Evento {
  id: string;
  status: Status;
  sort: number | null;
  titolo: string;
  slug: string;
  sub_brand: SubBrand | null;
  data_inizio: string;
  data_fine: string | null;
  tutto_il_giorno: boolean;
  ricorrenza: Ricorrenza | null;
  note_ricorrenza: string | null;
  luogo_libero: string | null;
  descrizione_breve: string | null;
  descrizione_completa: string | null;
  ospiti_speciali: string | null;
  locandina: string | null;
  link_prenotazione: string | null;
  sede: string | null;
  progetto_collegato: string | null;
}

export interface Progetto {
  id: string;
  status: Status;
  sort: number | null;
  titolo: string;
  sottotitolo: string | null;
  slug: string;
  stato_progetto: StatoProgetto | null;
  sub_brand: SubBrand | null;
  luogo: string | null;
  data_inizio: string | null;
  data_fine: string | null;
  descrizione_breve: string | null;
  descrizione_completa: string | null;
  target_beneficiari: string | null;
  risultati_raggiunti: string | null;
  copertina: string | null;
  bando_finanziatore: string | null;
  importo_finanziato: number | null;
}
