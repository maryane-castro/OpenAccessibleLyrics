import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Track } from '../services/lrclib';
import { SearchScreen } from '../screens/SearchScreen';
import { LyricsScreen } from '../screens/LyricsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootStackParamList = {
  Search: { initialQuery?: string } | undefined;
  Lyrics: { track: Track };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Lyrics" component={LyricsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
