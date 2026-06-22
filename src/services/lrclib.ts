const BASE_URL = 'https://lrclib.net/api';

export type Track = {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
};

export async function searchTracks(query: string): Promise<Track[]> {
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function stripTimestamps(synced: string): string {
  return synced
    .replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

export function extractPlainText(track: Track): string | null {
  if (track.plainLyrics) return track.plainLyrics;
  if (track.syncedLyrics) return stripTimestamps(track.syncedLyrics);
  return null;
}
