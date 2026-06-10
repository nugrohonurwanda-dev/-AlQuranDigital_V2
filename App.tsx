// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { FontProvider } from './src/contexts/FontContext';
import { AudioProvider } from './src/contexts/AudioContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FontProvider>
          <AudioProvider>
            <AppNavigator />
          </AudioProvider>
        </FontProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
