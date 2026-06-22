import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { FontSizeProvider } from './src/context/FontSizeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts(Ionicons.font);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#F7F7FA' }} />;
  }

  return (
    <SafeAreaProvider>
      <FontSizeProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </FontSizeProvider>
    </SafeAreaProvider>
  );
}
