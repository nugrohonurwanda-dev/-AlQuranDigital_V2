// navigation/SavedStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { SavedStackParamList } from '../types/navigation';
import { makeStackScreenOptions } from './screenOptions';
import SavedScreen from '../screens/SavedScreen';

const Stack = createStackNavigator<SavedStackParamList>();

export default function SavedStackNavigator() {
  const { colors, isDarkMode } = useTheme();
  return (
    <Stack.Navigator screenOptions={makeStackScreenOptions(colors, isDarkMode)}>
      <Stack.Screen
        name="Saved"
        component={SavedScreen}
        options={{ title: 'Tersimpan', headerTitleAlign: 'center' }}
      />
    </Stack.Navigator>
  );
}
