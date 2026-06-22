import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';

type ContactEntry = {
  id?: string;
  name?: string;
  phoneNumbers?: Contacts.PhoneNumber[];
};
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFontSize } from '../hooks/useFontSize';
import { colors, spacing, borderRadius, minTouchTarget, lineHeight } from '../theme';

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
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso aos contatos nas configurações do celular.',
      );
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      sort: Contacts.SortTypes.FirstName,
    });
    const entries = data as unknown as ContactEntry[];
    setContacts(entries.filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0));
    setSearch('');
    setPickerVisible(true);
  }

  async function selectContact(contact: ContactEntry) {
    const raw = contact.phoneNumbers![0].number!;
    const digits = raw.replace(/\D/g, '');
    const number = digits.startsWith('55') ? digits : '55' + digits;
    const info: ContactInfo = { name: contact.name ?? raw, number };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    setSaved(info);
    setPickerVisible(false);
    setSaveConfirmed(true);
    setTimeout(() => setSaveConfirmed(false), 2000);
  }

  const filtered = contacts.filter((c) =>
    (c.name ?? '').toLowerCase().includes(search.toLowerCase()),
  );

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
          Configurações
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { fontSize, lineHeight: lineHeight(fontSize) }]}>
          Contato para enviar a letra
        </Text>

        {saved ? (
          <View style={styles.savedCard}>
            <Text style={[styles.savedName, { fontSize, lineHeight: lineHeight(fontSize) }]}>
              {saved.name}
            </Text>
            <Text style={[styles.savedNumber, { fontSize: fontSize - 4 }]}>
              +{saved.number}
            </Text>
          </View>
        ) : (
          <Text style={[styles.hint, { fontSize: fontSize - 4 }]}>
            Nenhum contato selecionado.
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [styles.pickButton, pressed && styles.pressed]}
          onPress={openPicker}
          accessibilityLabel="Escolher contato"
          accessibilityRole="button"
        >
          <Text style={styles.pickButtonLabel}>
            {saved ? 'Trocar contato' : 'Escolher contato'}
          </Text>
        </Pressable>

        {saveConfirmed && (
          <Text style={[styles.confirmed, { fontSize: fontSize - 2 }]}>Salvo!</Text>
        )}
      </View>

      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={[styles.modal, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.modalHeader}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={() => setPickerVisible(false)}
            >
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar contato..."
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id ?? item.name ?? Math.random().toString()}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
                onPress={() => selectContact(item)}
              >
                <Text style={[styles.contactName, { fontSize, lineHeight: lineHeight(fontSize) }]}>
                  {item.name}
                </Text>
                <Text style={[styles.contactNumber, { fontSize: fontSize - 4 }]}>
                  {item.phoneNumbers![0].number}
                </Text>
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
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
  savedCard: {
    backgroundColor: colors.cardBackground,
    borderRadius,
    padding: spacing.md,
    gap: spacing.xs,
  },
  savedName: {
    color: colors.text,
    fontWeight: 'bold',
  },
  savedNumber: {
    color: colors.textSecondary,
  },
  hint: {
    color: colors.textSecondary,
  },
  pickButton: {
    backgroundColor: colors.accent,
    borderRadius,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  pickButtonLabel: {
    color: colors.buttonText,
    fontWeight: 'bold',
    fontSize: 18,
  },
  confirmed: {
    color: colors.accent,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
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
    fontSize: 18,
  },
  contactRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: minTouchTarget,
    justifyContent: 'center',
  },
  contactName: {
    color: colors.text,
    fontWeight: '500',
  },
  contactNumber: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg,
  },
  pressed: {
    opacity: 0.75,
  },
});
