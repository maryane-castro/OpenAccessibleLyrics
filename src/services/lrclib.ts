import { Track } from './types';

const BASE_URL = 'https://lrclib.net/api';

type LrclibTrack = {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
};

function normalize(t: LrclibTrack): Track {
  return {
    id: `lrclib_${t.id}`,
    source: 'lrclib',
    trackName: t.trackName,
    artistName: t.artistName,
    albumName: t.albumName ?? '',
    plainLyrics: t.plainLyrics,
    syncedLyrics: t.syncedLyrics,
  };
}

export async function searchTracks(query: string): Promise<Track[]> {
  const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error(`lrclib HTTP ${response.status}`);
  const data: LrclibTrack[] = await response.json();
  return data.map(normalize);
}

export function stripTimestamps(synced: string): string {
  return synced
    .replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}
