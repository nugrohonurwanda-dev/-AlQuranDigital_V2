// navigation/TajweedStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { TajweedStackParamList } from '../types/navigation';
import { makeStackScreenOptions } from './screenOptions';
import TajweedLessonsScreen from '../screens/TajweedLessonsScreen';
import TajweedDetailScreen  from '../screens/TajweedDetailScreen';

const Stack = createStackNavigator<TajweedStackParamList>();

export default function TajweedStackNavigator() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Stack.Navigator screenOptions={makeStackScreenOptions(colors, isDarkMode)}>
      <Stack.Screen
        name="TajweedLessons"
        component={TajweedLessonsScreen}
        options={{ title: 'Materi Tajwid', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="TajweedDetail"
        component={TajweedDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
