import React, { useEffect, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { extractPlainText } from '../services/lrclib';
import { BottomBar } from '../components/BottomBar';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useFontSize } from '../hooks/useFontSize';
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
  const lyrics = extractPlainText(track);

  useEffect(() => {
    if (voice.transcript) {
      navigation.navigate('Search', { initialQuery: voice.transcript });
    }
  }, [voice.transcript]);

  function handleVoicePress() {
    if (voice.isListening) {
      voice.stop();
    } else {
      voice.start();
    }
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
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar para busca"
          accessibilityRole="button"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View style={styles.titleContainer}>
          <Text
            style={[styles.trackTitle, { fontSize, lineHeight: lineHeight(fontSize) }]}
            numberOfLines={1}
          >
            {track.trackName}
          </Text>
          <Text
            style={[
              styles.artistTitle,
              { fontSize: fontSize - 4, lineHeight: lineHeight(fontSize - 4) },
            ]}
            numberOfLines={1}
          >
            {track.artistName}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {lyrics ? (
          <Text
            style={[styles.lyrics, { fontSize, lineHeight: lineHeight(fontSize) }]}
            selectable={false}
          >
            {lyrics}
          </Text>
        ) : (
          <Text
            style={[styles.noLyrics, { fontSize, lineHeight: lineHeight(fontSize) }]}
          >
            Letra não disponível para esta música.
          </Text>
        )}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.printButton, pressed && styles.pressed]}
        onPress={handlePrint}
        accessibilityLabel="Imprimir letra"
        accessibilityRole="button"
      >
        <Text style={styles.printButtonLabel}>Imprimir</Text>
      </Pressable>

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
  titleContainer: {
    flex: 1,
  },
  trackTitle: {
    color: colors.text,
    fontWeight: 'bold',
  },
  artistTitle: {
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  lyrics: {
    color: colors.text,
  },
  noLyrics: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  printButton: {
    backgroundColor: colors.accent,
    margin: spacing.md,
    borderRadius,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  printButtonLabel: {
    color: colors.buttonText,
    fontWeight: 'bold',
    fontSize: 18,
  },
  pressed: {
    opacity: 0.75,
  },
});
