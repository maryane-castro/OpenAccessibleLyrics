import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FontSizeProvider } from './src/context/FontSizeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
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
