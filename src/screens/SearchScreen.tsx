import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchTracks } from '../services/lyrics';
import { Track } from '../services/types';
import { ResultCard } from '../components/ResultCard';
import { BottomBar } from '../components/BottomBar';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useFontSize } from '../hooks/useFontSize';
import { colors, spacing, borderRadius, minTouchTarget, lineHeight } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Search'>;
  route: RouteProp<RootStackParamList, 'Search'>;
};

export function SearchScreen({ navigation, route }: Props) {
  const initialQuery = route.params?.initialQuery ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { fontSize } = useFontSize();
  const voice = useVoiceSearch();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (voice.transcript) setQuery(voice.transcript);
  }, [voice.transcript]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function runSearch(q: string) {
    setLoading(true);
    setError(false);
    try {
      setResults(await searchTracks(q));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleVoicePress() {
    if (voice.isListening) {
      voice.stop();
    } else {
      setQuery('');
      setResults([]);
      setError(false);
      voice.start();
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { fontSize, lineHeight: lineHeight(fontSize) }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Nome da música ou artista"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              if (query.trim()) runSearch(query);
            }}
            accessibilityLabel="Campo de busca"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => { setQuery(''); setResults([]); setError(false); }}
              accessibilityLabel="Limpar busca"
              hitSlop={12}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Favorites')}
            accessibilityLabel="Favoritos"
            accessibilityRole="button"
          >
            <Ionicons name="heart-outline" size={24} color={colors.text} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel="Configurações"
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        )}

        {!loading && error && (
          <View style={styles.centered}>
            <Ionicons name="wifi-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.message, { fontSize, lineHeight: lineHeight(fontSize) }]}>
              Sem conexão.{'\n'}Verifique a internet.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
              onPress={() => runSearch(query)}
            >
              <Text style={styles.retryButtonLabel}>Tentar de novo</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && results.length === 0 && (
          <View style={styles.centered}>
            <Ionicons
              name={query.trim() ? 'musical-notes-outline' : 'mic-outline'}
              size={52}
              color={colors.border}
            />
            <Text style={[styles.message, { fontSize, lineHeight: lineHeight(fontSize) }]}>
              {query.trim()
                ? 'Nenhuma música encontrada.'
                : 'Fale ou digite o nome\nde uma música.'}
            </Text>
          </View>
        )}

        {!loading && !error && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ResultCard track={item} onPress={(t) => navigation.navigate('Lyrics', { track: t })} />
            )}
            contentContainerStyle={styles.list}
          />
        )}
      </View>

      <BottomBar isListening={voice.isListening} onVoicePress={handleVoicePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingLeft: spacing.md,
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: minTouchTarget,
    height: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius,
    paddingHorizontal: spacing.md,
    minHeight: minTouchTarget,
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  message: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  list: {
    paddingVertical: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.accent,
    borderRadius,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: minTouchTarget,
    justifyContent: 'center',
  },
  retryButtonLabel: {
    color: colors.buttonText,
    fontWeight: '700',
    fontSize: 18,
  },
  pressed: {
    opacity: 0.6,
  },
});
