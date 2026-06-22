import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFontSize } from '../hooks/useFontSize';
import { colors, spacing, minTouchTarget, borderRadius } from '../theme';

type Props = {
  isListening: boolean;
  onVoicePress: () => void;
};

export function BottomBar({ isListening, onVoicePress }: Props) {
  const { increase, decrease } = useFontSize();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.sm }]}>
      <View style={styles.fontButtons}>
        <Pressable
          style={({ pressed }) => [styles.fontButton, pressed && styles.pressed]}
          onPress={decrease}
          accessibilityLabel="Diminuir fonte"
          accessibilityRole="button"
        >
          <Text style={styles.fontButtonLabel}>− Fonte</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.fontButton, pressed && styles.pressed]}
          onPress={increase}
          accessibilityLabel="Aumentar fonte"
          accessibilityRole="button"
        >
          <Text style={styles.fontButtonLabel}>+ Fonte</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.voiceButton,
          isListening && styles.voiceButtonListening,
          pressed && styles.pressed,
        ]}
        onPress={onVoicePress}
        accessibilityLabel={isListening ? 'Ouvindo...' : 'Pesquisar por voz'}
        accessibilityRole="button"
      >
        <Text style={styles.voiceButtonLabel}>
          {isListening ? 'Ouvindo...' : '🎤 Por Voz'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  fontButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  fontButton: {
    backgroundColor: colors.accent,
    borderRadius,
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  fontButtonLabel: {
    color: colors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  voiceButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonListening: {
    backgroundColor: colors.listening,
  },
  voiceButtonLabel: {
    color: colors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.75,
  },
});
