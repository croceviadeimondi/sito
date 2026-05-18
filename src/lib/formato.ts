const formattatoreDataLunga = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const formattatoreSoloAnno = new Intl.DateTimeFormat('it-IT', { year: 'numeric' });

export function formattaData(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return formattatoreDataLunga.format(new Date(iso));
}

export function formattaAnno(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return formattatoreSoloAnno.format(new Date(iso));
}

export function formattaPeriodo(
  inizio: string | null | undefined,
  fine: string | null | undefined
): string | null {
  if (!inizio && !fine) return null;
  if (inizio && !fine) return formattaData(inizio);
  if (!inizio && fine) return formattaData(fine);
  const stessoGiorno = new Date(inizio!).toDateString() === new Date(fine!).toDateString();
  if (stessoGiorno) return formattaData(inizio);
  return `${formattaData(inizio)} - ${formattaData(fine)}`;
}
