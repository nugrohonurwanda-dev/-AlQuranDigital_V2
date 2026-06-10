// navigation/TabNavigator.tsx
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { TabParamList } from '../types/navigation';
import SurahStackNavigator    from './SurahStackNavigator';
import TajweedStackNavigator  from './TajweedStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof TabParamList, { active: IoniconsName; inactive: IoniconsName }> = {
  QuranTab:    { active: 'book',     inactive: 'book-outline'     },
  TajweedTab:  { active: 'school',   inactive: 'school-outline'   },
  SettingsTab: { active: 'settings', inactive: 'settings-outline' },
};

export default function TabNavigator() {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + Math.max(insets.bottom, 5);

  return (
    <Tab.Navigator
      testID="tab-navigator"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor:  colors.border,
          borderTopWidth:  1,
          paddingBottom:   Math.max(insets.bottom, 5),
          paddingTop:      8,
          height:          tabBarHeight,
          elevation:       8,
          shadowColor:     colors.shadow,
          shadowOffset:    { width: 0, height: -2 },
          shadowOpacity:   isDarkMode ? 0.3 : 0.1,
          shadowRadius:    3,
        },
        tabBarLabelStyle: {
          fontSize:    12,
          fontWeight:  '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 3,
        },
        tabBarItemStyle: { backgroundColor: colors.cardBackground },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name as keyof TabParamList];
          const name  = focused ? icons.active : icons.inactive;
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="QuranTab"
        component={SurahStackNavigator}
        options={{ tabBarLabel: "Al-Qur'an", tabBarAccessibilityLabel: "Tab Al-Qur'an" }}
      />
      <Tab.Screen
        name="TajweedTab"
        component={TajweedStackNavigator}
        options={{ tabBarLabel: 'Tajwid', tabBarAccessibilityLabel: 'Tab Tajwid' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{ tabBarLabel: 'Pengaturan', tabBarAccessibilityLabel: 'Tab Pengaturan' }}
      />
    </Tab.Navigator>
  );
}
