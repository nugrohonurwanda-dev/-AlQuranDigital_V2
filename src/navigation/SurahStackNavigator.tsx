// navigation/SurahStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { SurahStackParamList } from '../types/navigation';
import { makeStackScreenOptions } from './screenOptions';
import SurahListScreen      from '../screens/SurahListScreen';
import SurahDetailScreen    from '../screens/SurahDetailScreen';
import TajweedLessonsScreen from '../screens/TajweedLessonsScreen';
import TajweedDetailScreen  from '../screens/TajweedDetailScreen';

const Stack = createStackNavigator<SurahStackParamList>();

export default function SurahStackNavigator() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Stack.Navigator screenOptions={makeStackScreenOptions(colors, isDarkMode)}>
      <Stack.Screen
        name="SurahList"
        component={SurahListScreen}
        options={{ title: "Al-Qur'an", headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="SurahDetail"
        component={SurahDetailScreen}
        options={{ headerShown: false }}
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
          title:             route.params?.title ?? 'Detail',
          headerTitleAlign:  'center',
        })}
      />
    </Stack.Navigator>
  );
}
