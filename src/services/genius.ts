import { Track } from './types';

const BASE_URL = 'https://api.genius.com';

// Obtenha um token gratuito em https://genius.com/api-clients
export const GENIUS_ACCESS_TOKEN = 'NrbZdxzlgdsmBp6QF47Vgl-Cd0e_aepWBU3BpnZ0OJWTvBp8N3UJQ-EMHoYpxeWP';

type GeniusHit = {
  result: {
    id: number;
    title: string;
    primary_artist: { name: string };
    url: string;
  };
};

type GeniusSearchResponse = {
  response: { hits: GeniusHit[] };
};

export async function searchTracks(query: string): Promise<Track[]> {
  if (!GENIUS_ACCESS_TOKEN) return [];
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}` },
  });
  if (!response.ok) throw new Error(`Genius HTTP ${response.status}`);
  const data: GeniusSearchResponse = await response.json();

  return data.response.hits.map(({ result }) => ({
    id: `genius_${result.id}`,
    source: 'genius' as const,
    trackName: result.title,
    artistName: result.primary_artist.name,
    albumName: '',
    plainLyrics: null,
    syncedLyrics: null,
    sourceUrl: result.url,
  }));
}

export async function getLyrics(songUrl: string): Promise<string | null> {
  if (!songUrl) return null;
  const response = await fetch(songUrl);
  if (!response.ok) return null;
  const html = await response.text();

  // Extrai blocos com data-lyrics-container="true"
  const blockPattern = /data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/g;
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = blockPattern.exec(html)) !== null) {
    blocks.push(match[1]);
  }
  if (!blocks.length) return null;

  const decodeHtmlEntities = (s: string) =>
    s
      .replace(/&amp;/g, '&')
      .replace(/&apos;|&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

  return blocks
    .map((block) =>
      decodeHtmlEntities(
        block.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''),
      ).trim(),
    )
    .filter(Boolean)
    .join('\n\n');
}
