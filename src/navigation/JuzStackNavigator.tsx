// navigation/JuzStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { JuzStackParamList } from '../types/navigation';
import { makeStackScreenOptions } from './screenOptions';
import JuzListScreen   from '../screens/JuzListScreen';
import JuzDetailScreen from '../screens/JuzDetailScreen';

const Stack = createStackNavigator<JuzStackParamList>();

export default function JuzStackNavigator() {
  const { colors, isDarkMode } = useTheme();
  return (
    <Stack.Navigator screenOptions={makeStackScreenOptions(colors, isDarkMode)}>
      <Stack.Screen
        name="JuzList"
        component={JuzListScreen}
        options={{ title: 'Juz', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="JuzDetail"
        component={JuzDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
