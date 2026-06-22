import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const sorted = [...favorites].sort((a: Favorite, b: Favorite) =>
    sort === 'alpha'
      ? a.track.trackName.localeCompare(b.track.trackName, 'pt')
      : b.savedAt - a.savedAt,
  );

  function handleVoicePress() {
    if (voice.isListening) voice.stop();
    else voice.start();
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize, lineHeight: lineHeight(fontSize) }]}>
          Favoritos
        </Text>
        {favorites.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{favorites.length}</Text>
          </View>
        )}
      </View>

      {sorted.length > 0 && (
        <View style={styles.sortRow}>
          {(['recent', 'alpha'] as SortOrder[]).map((option) => (
            <Pressable
              key={option}
              style={({ pressed }) => [
                styles.sortChip,
                sort === option && styles.sortChipActive,
                pressed && styles.pressed,
              ]}
              onPress={() => setSort(option)}
              accessibilityRole="button"
            >
              <Text style={[styles.sortChipLabel, sort === option && styles.sortChipLabelActive]}>
                {option === 'recent' ? 'Mais recente' : 'A → Z'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={56} color={colors.border} />
          <Text style={[styles.emptyTitle, { fontSize, lineHeight: lineHeight(fontSize) }]}>
            Nenhuma música salva ainda.
          </Text>
          <Text style={[styles.emptyHint, { fontSize: fontSize - 4 }]}>
            Toque no coração na tela da letra para salvar.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => String(item.track.id)}
          renderItem={({ item }) => (
            <ResultCard
              track={item.track}
              onPress={(t: Track) => navigation.navigate('Lyrics', { track: t })}
            />
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
    paddingRight: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    width: minTouchTarget,
    height: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    color: colors.buttonText,
    fontSize: 13,
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortChip: {
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sortChipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortChipLabelActive: {
    color: colors.buttonText,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyHint: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  list: {
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
});
