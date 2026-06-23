export type Track = {
  id: string;
  source: 'lrclib' | 'letras' | 'genius';
  trackName: string;
  artistName: string;
  albumName: string;
  plainLyrics: string | null;
  syncedLyrics: string | null;
  sourceUrl?: string; // URL da página do Genius para busca de letra
};
