// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider }          from './src/contexts/ThemeContext';
import { FontProvider }           from './src/contexts/FontContext';
import { AudioProvider }          from './src/contexts/AudioContext';
import { BookmarkProvider }       from './src/contexts/BookmarkContext';
import { ReadingProgressProvider } from './src/contexts/ReadingProgressContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FontProvider>
          <AudioProvider>
            <BookmarkProvider>
              <ReadingProgressProvider>
                <AppNavigator />
              </ReadingProgressProvider>
            </BookmarkProvider>
          </AudioProvider>
        </FontProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
