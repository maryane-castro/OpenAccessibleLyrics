import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, ContactField, requestPermissionsAsync } from 'expo-contacts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFontSize } from '../hooks/useFontSize';
import { colors, spacing, borderRadius, minTouchTarget, lineHeight } from '../theme';

type ContactEntry = { id: string; fullName?: string | null; phone: string };

const STORAGE_KEY = '@whatsapp_contact';
type ContactInfo = { name: string; number: string };

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export function SettingsScreen({ navigation }: Props) {
  const [saved, setSaved] = useState<ContactInfo | null>(null);
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [search, setSearch] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saveConfirmed, setSaveConfirmed] = useState(false);
  const { fontSize } = useFontSize();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setSaved(JSON.parse(raw));
    });
  }, []);

  async function openPicker() {
    const { status, canAskAgain } = await requestPermissionsAsync();
    if (status !== 'granted') {
      if (canAskAgain === false) {
        Alert.alert(
          'Permissão necessária',
          'O acesso aos contatos foi negado. Abra as configurações do app para permitir.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir configurações', onPress: () => Linking.openSettings() },
          ],
        );
      } else {
        Alert.alert('Permissão necessária', 'Permita o acesso aos contatos para continuar.');
      }
      return;
    }
    try {
      const allDetails = await Contact.getAllDetails(
        [ContactField.FULL_NAME, ContactField.PHONES] as const,
      );
      const entries: ContactEntry[] = allDetails
        .filter((c) => c.phones && c.phones.length > 0 && c.phones[0].number)
        .map((c) => ({ id: c.id, fullName: c.fullName, phone: c.phones![0].number! }));
      if (entries.length === 0) {
        Alert.alert('Sem contatos', 'Nenhum contato com número encontrado.');
        return;
      }
      setContacts(entries);
      setSearch('');
      setPickerVisible(true);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os contatos. Tente novamente.');
    }
  }

  async function selectContact(contact: ContactEntry) {
    const digits = contact.phone.replace(/\D/g, '');
    const number = digits.startsWith('55') ? digits : '55' + digits;
    const info: ContactInfo = { name: contact.fullName ?? contact.phone, number };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    setSaved(info);
    setPickerVisible(false);
    setSaveConfirmed(true);
    setTimeout(() => setSaveConfirmed(false), 2500);
  }

  const filtered = contacts.filter((c) =>
    (c.fullName ?? '').toLowerCase().includes(search.toLowerCase()),
  );

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
          Configurações
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionLabel, { fontSize: fontSize - 6 }]}>
          CONTATO PARA IMPRIMIR A LETRA
        </Text>

        {saved ? (
          <View style={styles.contactCard}>
            <View style={styles.contactIcon}>
              <Ionicons name="person" size={28} color={colors.accent} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, { fontSize, lineHeight: lineHeight(fontSize) }]}>
                {saved.name}
              </Text>
              <Text style={[styles.contactNumber, { fontSize: fontSize - 4 }]}>
                +{saved.number}
              </Text>
            </View>
            <Pressable
              onPress={async () => {
                await AsyncStorage.removeItem(STORAGE_KEY);
                setSaved(null);
              }}
              hitSlop={12}
              accessibilityLabel="Remover contato"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="person-add-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.emptyCardText, { fontSize: fontSize - 2 }]}>
              Nenhum contato selecionado
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.pickButton, pressed && styles.pressed]}
          onPress={openPicker}
          accessibilityLabel={saved ? 'Trocar contato' : 'Escolher contato'}
          accessibilityRole="button"
        >
          <Ionicons name="people-outline" size={20} color={colors.buttonText} />
          <Text style={[styles.pickButtonLabel, { fontSize: fontSize - 2 }]}>
            {saved ? 'Trocar contato' : 'Escolher contato'}
          </Text>
        </Pressable>

        {saveConfirmed && (
          <View style={styles.toast}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#166534" />
            <Text style={[styles.toastText, { fontSize: fontSize - 4 }]}>Contato salvo!</Text>
          </View>
        )}
      </View>

      <Modal
        visible={pickerVisible}
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={[styles.modal, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              onPress={() => setPickerVisible(false)}
              accessibilityLabel="Fechar"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={26} color={colors.text} />
            </Pressable>
            <View style={styles.modalSearchBar}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.modalSearchInput, { fontSize }]}
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar contato..."
                placeholderTextColor={colors.textSecondary}
                autoFocus
              />
            </View>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.contactRow, pressed && styles.contactRowPressed]}
                onPress={() => selectContact(item)}
              >
                <View style={styles.contactRowIcon}>
                  <Ionicons name="person-outline" size={20} color={colors.accent} />
                </View>
                <View style={styles.contactRowInfo}>
                  <Text style={[styles.rowName, { fontSize, lineHeight: lineHeight(fontSize) }]}>
                    {item.fullName ?? item.phone}
                  </Text>
                  <Text style={[styles.rowNumber, { fontSize: fontSize - 4 }]}>
                    {item.phone}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
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
    paddingRight: spacing.md,
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
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contactCard: {
    backgroundColor: colors.surface,
    borderRadius,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    color: colors.text,
    fontWeight: '600',
  },
  contactNumber: {
    color: colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyCardText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  pickButton: {
    backgroundColor: colors.accent,
    borderRadius,
    minHeight: minTouchTarget,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pickButtonLabel: {
    color: colors.buttonText,
    fontWeight: '700',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F0FDF4',
    borderRadius,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  toastText: {
    color: '#166534',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingRight: spacing.md,
    gap: spacing.sm,
  },
  modalSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  modalSearchInput: {
    flex: 1,
    color: colors.text,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    minHeight: minTouchTarget,
    backgroundColor: colors.surface,
  },
  contactRowPressed: {
    backgroundColor: colors.background,
  },
  contactRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactRowInfo: {
    flex: 1,
  },
  rowName: {
    color: colors.text,
    fontWeight: '500',
  },
  rowNumber: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 44 + spacing.md,
  },
});
