import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchTracks, Track } from '../services/lrclib';
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
    if (voice.transcript) {
      setQuery(voice.transcript);
    }
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
      const tracks = await searchTracks(q);
      setResults(tracks);
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

  function handleResultPress(track: Track) {
    navigation.navigate('Lyrics', { track });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Configurações"
          accessibilityRole="button"
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
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
      </View>

      <View style={styles.content}>
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        )}

        {!loading && error && (
          <View style={styles.centered}>
            <Text style={[styles.message, { fontSize, lineHeight: lineHeight(fontSize) }]}>
              Não foi possível buscar.{'\n'}Verifique a internet.
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
            <Text style={[styles.message, { fontSize, lineHeight: lineHeight(fontSize) }]}>
              {query.trim()
                ? 'Nenhuma música encontrada.'
                : 'Fale ou digite o nome de uma música.'}
            </Text>
          </View>
        )}

        {!loading && !error && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ResultCard track={item} onPress={handleResultPress} />
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsButton: {
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 28,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.cardBackground,
    minHeight: minTouchTarget,
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
    fontWeight: 'bold',
    fontSize: 18,
  },
  pressed: {
    opacity: 0.75,
  },
});
