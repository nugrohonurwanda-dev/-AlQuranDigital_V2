// navigation/SettingsStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { SettingsStackParamList } from '../types/navigation';
import { makeStackScreenOptions } from './screenOptions';
import SettingsScreen       from '../screens/SettingsScreen';
import TajweedLessonsScreen from '../screens/TajweedLessonsScreen';
import TajweedDetailScreen  from '../screens/TajweedDetailScreen';

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsStackNavigator() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Stack.Navigator screenOptions={makeStackScreenOptions(colors, isDarkMode)}>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Setelan & Personalisasi', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="TajweedLessons"
        component={TajweedLessonsScreen}
        options={{ title: 'Panduan Tajwid', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="TajweedDetail"
        component={TajweedDetailScreen}
        options={({ route }) => ({
          title:            route.params?.title ?? 'Detail',
          headerTitleAlign: 'center',
        })}
      />
    </Stack.Navigator>
  );
}
