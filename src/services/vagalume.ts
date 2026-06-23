import { Track } from './types';

const BASE_URL = 'https://api.vagalume.com.br';

// Obtenha uma chave gratuita em https://api.vagalume.com.br/docs/
export const VAGALUME_API_KEY = '';

type VagalumeSearchDoc = {
  id: string;
  band: string;
  mus: Array<{ name: string; url: string; id: string }>;
};

type VagalumeSearchResponse = {
  response: {
    numFound: number;
    docs: VagalumeSearchDoc[];
  };
};

type VagalumeLyricsResponse = {
  mus: Array<{ id: string; name: string; text: string }>;
  art: { id: string; name: string };
  type: 'exact' | 'aprox' | 'notfound';
};

export async function searchTracks(query: string): Promise<Track[]> {
  if (!VAGALUME_API_KEY) return [];
  const url = `${BASE_URL}/search.artmus/?musics=${encodeURIComponent(query)}&apikey=${VAGALUME_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Vagalume HTTP ${response.status}`);
  const data: VagalumeSearchResponse = await response.json();

  const tracks: Track[] = [];
  for (const doc of data.response.docs) {
    for (const mus of doc.mus) {
      tracks.push({
        id: `vagalume_${mus.id}`,
        source: 'letras',
        trackName: mus.name,
        artistName: doc.band,
        albumName: '',
        plainLyrics: null,
        syncedLyrics: null,
      });
    }
  }
  return tracks;
}

export async function getLyrics(artistName: string, trackName: string): Promise<string | null> {
  if (!VAGALUME_API_KEY) return null;
  const url = `${BASE_URL}/search.php?art=${encodeURIComponent(artistName)}&mus=${encodeURIComponent(trackName)}&apikey=${VAGALUME_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data: VagalumeLyricsResponse = await response.json();
  if (data.type === 'notfound' || !data.mus.length) return null;
  return data.mus[0].text ?? null;
}
