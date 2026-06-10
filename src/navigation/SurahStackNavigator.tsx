// navigation/SurahStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { SurahStackParamList } from '../types/navigation';
import { makeStackScreenOptions } from './screenOptions';
import SurahListScreen   from '../screens/SurahListScreen';
import SurahDetailScreen from '../screens/SurahDetailScreen';

const Stack = createStackNavigator<SurahStackParamList>();

export default function SurahStackNavigator() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Stack.Navigator screenOptions={makeStackScreenOptions(colors, isDarkMode)}>
      <Stack.Screen
        name="SurahList"
        component={SurahListScreen}
        options={{ title: "Al-Qur'an Digital", headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="SurahDetail"
        component={SurahDetailScreen}
        options={({ route }) => ({
          title: route.params?.surah?.name_simple ?? 'Surah',
          headerTitleAlign: 'center',
        })}
      />
    </Stack.Navigator>
  );
}
