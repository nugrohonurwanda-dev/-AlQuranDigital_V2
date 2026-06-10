// navigation/AppNavigator.tsx
import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../contexts/ThemeContext';
import TabNavigator from './TabNavigator';

export default function AppNavigator() {
  const { colors, isDarkMode } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} translucent />
      <View style={{ flex: 1, backgroundColor: colors.background }} testID="app-container">
        <TabNavigator />
      </View>
    </NavigationContainer>
  );
}
