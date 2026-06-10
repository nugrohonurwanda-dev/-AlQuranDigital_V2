// navigation/SettingsStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { SettingsStackParamList } from '../types/navigation';
import { makeStackScreenOptions } from './screenOptions';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsStackNavigator() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Stack.Navigator screenOptions={makeStackScreenOptions(colors, isDarkMode)}>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Pengaturan', headerTitleAlign: 'center' }}
      />
    </Stack.Navigator>
  );
}
