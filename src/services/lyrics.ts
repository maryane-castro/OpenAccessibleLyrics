import { Track } from './types';
import * as lrclib from './lrclib';
import * as letras from './letras';
import * as genius from './genius';
import { stripTimestamps } from './lrclib';

// Cadeia: lrclib → letras.mus.br → Genius
// Avança para o próximo quando o anterior não retorna resultados.
// Erro na lrclib propaga (sem internet). Erros nos fallbacks são silenciados.
export async function searchTracks(query: string): Promise<Track[]> {
  const lrclibResults = await lrclib.searchTracks(query);
  if (lrclibResults.length > 0) return lrclibResults;

  const letrasResults = await letras.searchTracks(query).catch(() => [] as Track[]);
  if (letrasResults.length > 0) return letrasResults;

  return genius.searchTracks(query).catch(() => []);
}

export function extractPlainText(track: Track): string | null {
  if (track.plainLyrics) return track.plainLyrics;
  if (track.syncedLyrics) return stripTimestamps(track.syncedLyrics);
  return null;
}

export async function getLyrics(track: Track): Promise<string | null> {
  if (track.source === 'letras') {
    return letras.getLyrics(track.sourceUrl ?? '');
  }
  if (track.source === 'genius') {
    return genius.getLyrics(track.sourceUrl ?? '');
  }
  return extractPlainText(track);
}
