// navigation/screenOptions.ts
import { ColorScheme } from '../contexts/ThemeContext';

/**
 * Shared stack header options used by all three stack navigators.
 * Extract here to avoid copy-pasting across navigators.
 */
export const makeStackScreenOptions = (colors: ColorScheme, isDarkMode: boolean) => ({
  headerStyle: {
    backgroundColor: colors.primary,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   isDarkMode ? 0.3 : 0.25,
    shadowRadius:    3.84,
    elevation:       5,
  },
  headerTintColor:       colors.headerText ?? '#fff',
  headerTitleStyle:      { fontWeight: '600' as const, fontSize: 18, color: colors.headerText ?? '#fff' },
  headerBackTitleVisible: false,
  cardStyle:             { backgroundColor: colors.background },
  gestureEnabled:        true,
  gestureDirection:      'horizontal' as const,
});
