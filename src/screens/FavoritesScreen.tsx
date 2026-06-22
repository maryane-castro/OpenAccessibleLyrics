import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Track } from '../services/lrclib';
import { ResultCard } from '../components/ResultCard';
import { BottomBar } from '../components/BottomBar';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useFavorites, Favorite } from '../hooks/useFavorites';
import { useFontSize } from '../hooks/useFontSize';
import { colors, spacing, borderRadius, minTouchTarget, lineHeight } from '../theme';

type SortOrder = 'alpha' | 'recent';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Favorites'>;
};

export function FavoritesScreen({ navigation }: Props) {
  const [sort, setSort] = useState<SortOrder>('recent');
  const { favorites } = useFavorites();
  const { fontSize } = useFontSize();
  const voice = useVoiceSearch();
  const insets = useSafeAreaInsets();

  const sorted = [...favorites].sort((a: Favorite, b: Favorite) => {
    if (sort === 'alpha') {
      return a.track.trackName.localeCompare(b.track.trackName, 'pt');
    }
    return b.savedAt - a.savedAt;
  });

  function handleVoicePress() {
    if (voice.isListening) {
      voice.stop();
    } else {
      voice.start();
    }
  }

  function handleTrackPress(track: Track) {
    navigation.navigate('Lyrics', { track });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize, lineHeight: lineHeight(fontSize) }]}>
          Favoritos
        </Text>
      </View>

      <View style={styles.sortRow}>
        <Pressable
          style={({ pressed }) => [
            styles.sortButton,
            sort === 'alpha' && styles.sortButtonActive,
            pressed && styles.pressed,
          ]}
          onPress={() => setSort('alpha')}
          accessibilityLabel="Ordenar de A a Z"
          accessibilityRole="button"
        >
          <Text style={[styles.sortLabel, sort === 'alpha' && styles.sortLabelActive]}>
            A → Z
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.sortButton,
            sort === 'recent' && styles.sortButtonActive,
            pressed && styles.pressed,
          ]}
          onPress={() => setSort('recent')}
          accessibilityLabel="Ordenar por mais recente"
          accessibilityRole="button"
        >
          <Text style={[styles.sortLabel, sort === 'recent' && styles.sortLabelActive]}>
            Mais recente
          </Text>
        </Pressable>
      </View>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { fontSize, lineHeight: lineHeight(fontSize) }]}>
            Nenhuma música favorita ainda.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => String(item.track.id)}
          renderItem={({ item }) => (
            <ResultCard track={item.track} onPress={handleTrackPress} />
          )}
          contentContainerStyle={styles.list}
        />
      )}

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
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: colors.accent,
  },
  headerTitle: {
    color: colors.text,
    fontWeight: 'bold',
  },
  sortRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortButton: {
    flex: 1,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius,
    backgroundColor: colors.cardBackground,
  },
  sortButtonActive: {
    backgroundColor: colors.accent,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  sortLabelActive: {
    color: colors.buttonText,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  list: {
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.75,
  },
});
