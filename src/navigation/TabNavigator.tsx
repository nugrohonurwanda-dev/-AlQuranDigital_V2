// navigation/TabNavigator.tsx
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { TabParamList } from '../types/navigation';
import SurahStackNavigator    from './SurahStackNavigator';
import JuzStackNavigator      from './JuzStackNavigator';
import SavedStackNavigator    from './SavedStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<keyof TabParamList, {
  label: string;
  active: IoniconsName;
  inactive: IoniconsName;
}> = {
  QuranTab:    { label: 'Surah',     active: 'book',              inactive: 'book-outline'     },
  JuzTab:      { label: 'Juz',       active: 'list',              inactive: 'list-outline'     },
  SavedTab:    { label: 'Tersimpan', active: 'bookmark',          inactive: 'bookmark-outline' },
  SettingsTab: { label: 'Setelan',   active: 'settings',          inactive: 'settings-outline' },
};

export default function TabNavigator() {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 64 + Math.max(insets.bottom, 5);

  return (
    <Tab.Navigator
      testID="tab-navigator"
      screenOptions={({ route }) => {
        const cfg = TAB_CONFIG[route.name as keyof TabParamList];
        return {
          headerShown:             false,
          tabBarActiveTintColor:   colors.primary,
          tabBarInactiveTintColor: colors.navInactive,
          tabBarStyle: {
            backgroundColor: colors.cardBackground,
            borderTopColor:  colors.border,
            borderTopWidth:  StyleSheet.hairlineWidth,
            paddingBottom:   Math.max(insets.bottom, 5),
            paddingTop:      6,
            height:          tabBarHeight,
            elevation:       8,
            shadowColor:     '#000',
            shadowOffset:    { width: 0, height: -2 },
            shadowOpacity:   isDarkMode ? 0.3 : 0.08,
            shadowRadius:    6,
          },
          tabBarLabelStyle: {
            fontSize:     11,
            fontWeight:   '600',
            marginBottom: Platform.OS === 'ios' ? 0 : 4,
          },
          tabBarItemStyle: {
            backgroundColor: colors.cardBackground,
            paddingTop:      2,
          },
          tabBarIcon: ({ focused, color }) => {
            const name = focused ? cfg.active : cfg.inactive;
            if (focused) {
              return (
                <View style={[
                  styles.pillIcon,
                  { backgroundColor: colors.primary + '1A' },
                ]}>
                  <Ionicons name={name} size={22} color={color} />
                </View>
              );
            }
            return <Ionicons name={name} size={22} color={color} />;
          },
          tabBarLabel: cfg.label,
        };
      }}
    >
      <Tab.Screen name="QuranTab"    component={SurahStackNavigator}    />
      <Tab.Screen name="JuzTab"      component={JuzStackNavigator}      />
      <Tab.Screen name="SavedTab"    component={SavedStackNavigator}    />
      <Tab.Screen name="SettingsTab" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  pillIcon: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical:   4,
    marginTop:         -2,
  },
});
