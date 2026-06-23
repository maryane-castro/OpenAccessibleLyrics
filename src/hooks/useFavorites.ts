import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track } from '../services/lrclib';

const STORAGE_KEY = '@favorites';

export type Favorite = { track: Track; savedAt: number };

export function useFavorites(trackId?: number) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  async function load() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    setFavorites(raw ? JSON.parse(raw) : []);
  }

  useEffect(() => {
    load();
  }, []);

  const isFavorite = trackId !== undefined
    ? favorites.some((f) => f.track.id === trackId)
    : false;

  async function toggle(track: Track) {
    const exists = favorites.some((f) => f.track.id === track.id);
    const next = exists
      ? favorites.filter((f) => f.track.id !== track.id)
      : [...favorites, { track, savedAt: Date.now() }];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setFavorites(next);
  }

  return { favorites, isFavorite, toggle, reload: load };
}
