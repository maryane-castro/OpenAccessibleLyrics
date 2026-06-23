import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../services/types';
import { useFontSize } from '../hooks/useFontSize';
import { colors, spacing, minTouchTarget, borderRadius, lineHeight, shadow } from '../theme';

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
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={styles.chevron} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    minHeight: minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
  },
  trackName: {
    color: colors.text,
    fontWeight: '600',
  },
  artistName: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chevron: {
    paddingHorizontal: spacing.md,
  },
});
