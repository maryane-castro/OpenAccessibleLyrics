import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Track } from '../services/lrclib';
import { useFontSize } from '../hooks/useFontSize';
import { colors, spacing, minTouchTarget, borderRadius, lineHeight } from '../theme';

type Props = {
  track: Track;
  onPress: (track: Track) => void;
};

export function ResultCard({ track, onPress }: Props) {
  const { fontSize } = useFontSize();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(track)}
      accessibilityRole="button"
      accessibilityLabel={`${track.trackName} de ${track.artistName}`}
    >
      <View style={styles.content}>
        <Text
          style={[styles.trackName, { fontSize, lineHeight: lineHeight(fontSize) }]}
          numberOfLines={2}
        >
          {track.trackName}
        </Text>
        <Text
          style={[
            styles.artistName,
            { fontSize: fontSize - 4, lineHeight: lineHeight(fontSize - 4) },
          ]}
          numberOfLines={1}
        >
          {track.artistName}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    minHeight: minTouchTarget,
  },
  pressed: {
    opacity: 0.75,
  },
  content: {
    padding: spacing.md,
    justifyContent: 'center',
  },
  trackName: {
    color: colors.text,
    fontWeight: 'bold',
  },
  artistName: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
