import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <Pressable
        style={({ pressed }) => [styles.fontButton, pressed && styles.pressed]}
        onPress={decrease}
        accessibilityLabel="Diminuir fonte"
        accessibilityRole="button"
      >
        <Text style={styles.fontButtonLabel}>A−</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.fontButton, pressed && styles.pressed]}
        onPress={increase}
        accessibilityLabel="Aumentar fonte"
        accessibilityRole="button"
      >
        <Text style={styles.fontButtonLabel}>A+</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.voiceButton,
          isListening && styles.voiceButtonListening,
          pressed && styles.voiceButtonPressed,
        ]}
        onPress={onVoicePress}
        accessibilityLabel={isListening ? 'Parar escuta' : 'Pesquisar por voz'}
        accessibilityRole="button"
      >
        <Ionicons
          name={isListening ? 'stop' : 'mic-outline'}
          size={22}
          color={colors.buttonText}
        />
        <Text style={styles.voiceButtonLabel}>
          {isListening ? 'Ouvindo...' : 'Por Voz'}
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
    paddingTop: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fontButton: {
    backgroundColor: colors.surface,
    borderRadius,
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  fontButtonLabel: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  voiceButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  voiceButtonListening: {
    backgroundColor: colors.listening,
  },
  voiceButtonPressed: {
    opacity: 0.88,
  },
  voiceButtonLabel: {
    color: colors.buttonText,
    fontWeight: '700',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.6,
  },
});
