import { Track } from './types';

const SEARCH_URL = 'https://solr.sscdn.co/letras/m5/';
const LYRICS_BASE = 'https://www.letras.mus.br';

type LetrasDoc = {
  art: string;
  dns: string;
  txt: string;
  imu: number;
  url: string;
};

type LetrasResponse = {
  response: {
    numFound: number;
    docs: LetrasDoc[];
  };
};

export async function searchTracks(query: string): Promise<Track[]> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&wt=json&callback=LetrasSug`;
  const response = await fetch(url, {
    headers: {
      Origin: 'https://www.letras.mus.br',
      Referer: 'https://www.letras.mus.br/',
    },
  });
  if (!response.ok) throw new Error(`Letras HTTP ${response.status}`);
  const text = await response.text();
  // Resposta vem como JSONP: s({...}) — remove o wrapper
  const json = text.replace(/^[^(]+\(/, '').replace(/\)\s*$/, '');
  const data: LetrasResponse = JSON.parse(json);

  return data.response.docs.map((doc) => ({
    id: `letras_${doc.imu}`,
    source: 'letras' as const,
    trackName: doc.txt,
    artistName: doc.art,
    albumName: '',
    plainLyrics: null,
    syncedLyrics: null,
    sourceUrl: `${LYRICS_BASE}/${doc.dns}/${doc.url}/`,
  }));
}

export async function getLyrics(songUrl: string): Promise<string | null> {
  const response = await fetch(songUrl);
  if (!response.ok) return null;
  const html = await response.text();

  const match = html.match(/class="lyric-original"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
  if (!match) return null;

  const decodeEntities = (s: string) =>
    s
      .replace(/&amp;/g, '&')
      .replace(/&apos;|&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

  return decodeEntities(
    match[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  ).trim();
}
