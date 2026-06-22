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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, ContactField, requestPermissionsAsync } from 'expo-contacts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFontSize } from '../hooks/useFontSize';
import { colors, spacing, borderRadius, minTouchTarget, lineHeight } from '../theme';

type ContactEntry = {
  id: string;
  fullName?: string | null;
  phone: string;
};

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
        .map((c) => ({
          id: c.id,
          fullName: c.fullName,
          phone: c.phones![0].number!,
        }));
      if (entries.length === 0) {
        Alert.alert('Nenhum contato', 'Não foram encontrados contatos com número de telefone.');
        return;
      }
      setContacts(entries);
      setSearch('');
      setPickerVisible(true);
    } catch (err) {
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
    setTimeout(() => setSaveConfirmed(false), 2000);
  }

  const filtered = contacts.filter((c) =>
    (c.fullName ?? '').toLowerCase().includes(search.toLowerCase()),
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
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
                onPress={() => selectContact(item)}
              >
                <Text style={[styles.contactName, { fontSize, lineHeight: lineHeight(fontSize) }]}>
                  {item.fullName ?? item.phone}
                </Text>
                <Text style={[styles.contactNumber, { fontSize: fontSize - 4 }]}>
                  {item.phone}
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
