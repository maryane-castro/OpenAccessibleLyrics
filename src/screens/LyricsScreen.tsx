import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { extractPlainText, getLyrics } from '../services/lyrics';
import { BottomBar } from '../components/BottomBar';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useFontSize } from '../hooks/useFontSize';
import { useFavorites } from '../hooks/useFavorites';
import { colors, spacing, borderRadius, minTouchTarget, lineHeight } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Lyrics'>;
  route: RouteProp<RootStackParamList, 'Lyrics'>;
};

export function LyricsScreen({ navigation, route }: Props) {
  const { track } = route.params;
  const { fontSize } = useFontSize();
  const voice = useVoiceSearch();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggle } = useFavorites(track.id);

  const [lyrics, setLyrics] = useState<string | null>(() => extractPlainText(track));
  const [fetchingLyrics, setFetchingLyrics] = useState(track.source !== 'lrclib');

  useEffect(() => {
    if (track.source === 'lrclib') return;
    getLyrics(track)
      .then(setLyrics)
      .catch(() => setLyrics(null))
      .finally(() => setFetchingLyrics(false));
  }, []);

  useEffect(() => {
    if (voice.transcript) {
      navigation.navigate('Search', { initialQuery: voice.transcript });
    }
  }, [voice.transcript]);

  function handleVoicePress() {
    if (voice.isListening) voice.stop();
    else voice.start();
  }

  async function handlePrint() {
    const text = lyrics ?? `${track.trackName} — ${track.artistName}\n\n(Letra não disponível)`;
    const raw = await AsyncStorage.getItem('@whatsapp_contact');
    if (raw) {
      const { number } = JSON.parse(raw) as { name: string; number: string };
      Linking.openURL(`https://wa.me/${number}?text=${encodeURIComponent(text)}`);
      return;
    }
    Share.share({ message: text });
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

        <View style={styles.trackInfo}>
          <Text
            style={[styles.trackTitle, { fontSize, lineHeight: lineHeight(fontSize) }]}
            numberOfLines={1}
          >
            {track.trackName}
          </Text>
          <Text
            style={[styles.artistName, { fontSize: fontSize - 4, lineHeight: lineHeight(fontSize - 4) }]}
            numberOfLines={1}
          >
            {track.artistName}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          onPress={() => toggle(track)}
          accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          accessibilityRole="button"
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? colors.star : colors.text}
          />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {fetchingLyrics ? (
          <View style={styles.noLyricsContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : lyrics ? (
          <Text
            style={[styles.lyrics, { fontSize, lineHeight: lineHeight(fontSize) }]}
            selectable={false}
          >
            {lyrics}
          </Text>
        ) : (
          <View style={styles.noLyricsContainer}>
            <Ionicons name="musical-notes-outline" size={52} color={colors.border} />
            <Text style={[styles.noLyrics, { fontSize, lineHeight: lineHeight(fontSize) }]}>
              Letra não disponível para esta música.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.printRow}>
        <Pressable
          style={({ pressed }) => [styles.printButton, pressed && styles.pressed]}
          onPress={handlePrint}
          accessibilityLabel="Imprimir letra"
          accessibilityRole="button"
        >
          <Ionicons name="share-outline" size={20} color={colors.buttonText} />
          <Text style={styles.printButtonLabel}>Imprimir</Text>
        </Pressable>
      </View>

      <BottomBar isListening={voice.isListening} onVoicePress={handleVoicePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconBtn: {
    width: minTouchTarget,
    height: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  trackTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  artistName: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  lyrics: {
    color: colors.text,
  },
  noLyricsContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xl * 2,
  },
  noLyrics: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  printRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  printButton: {
    backgroundColor: colors.accent,
    borderRadius,
    minHeight: minTouchTarget,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  printButtonLabel: {
    color: colors.buttonText,
    fontWeight: '700',
    fontSize: 18,
  },
  pressed: {
    opacity: 0.6,
  },
});
