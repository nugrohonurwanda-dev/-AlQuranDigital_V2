// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColorScheme {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  textLight: string;
  headerBackground: string;
  headerText: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  accent1: string;
  accent2: string;
  accent3: string;
  accent4: string;
  border: string;
  borderLight: string;
  shadow: string;
  shadowHover: string;
  ripple: string;
  searchBackground: string;
  searchBackgroundFocus: string;
  arabicText: string;
  bismillah: string;
  navBackground: string;
  navBorder: string;
  navActive: string;
  navInactive: string;
  navHover: string;
  exampleBackground: string;
  exampleBorder: string;
  toastBackground: string;
  toastText: string;
  optionBackground: string;
  optionHover: string;
  loadingPrimary: string;
  loadingSecondary: string;
}

export interface GradientScheme {
  body: string;
  header: string;
  cardIcon: string;
  playButton: string;
  playButtonActive: string;
  navActive: string;
  cardHover: string;
  verseActive: string;
  shimmer: string;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  colors: ColorScheme;
  gradients: GradientScheme;
  toggleDarkMode: () => Promise<void>;
}

// ─── Color definitions ────────────────────────────────────────────────────────

const lightColors: ColorScheme = {
  background:           '#f8f9fa',
  cardBackground:       '#ffffff',
  text:                 '#2d3748',
  textSecondary:        '#718096',
  textLight:            '#a0aec0',
  headerBackground:     'transparent',
  headerText:           '#ffffff',
  primary:              '#667eea',
  primaryDark:          '#764ba2',
  secondary:            '#4facfe',
  secondaryLight:       '#00f2fe',
  accent1:              '#e53e3e',
  accent2:              '#38a169',
  accent3:              '#3182ce',
  accent4:              '#805ad5',
  border:               '#e2e8f0',
  borderLight:          '#f0f0f0',
  shadow:               'rgba(0,0,0,0.08)',
  shadowHover:          'rgba(0,0,0,0.12)',
  ripple:               'rgba(102, 126, 234, 0.3)',
  searchBackground:     'rgba(255,255,255,0.15)',
  searchBackgroundFocus:'rgba(255,255,255,0.25)',
  arabicText:           '#2d3748',
  bismillah:            '#667eea',
  navBackground:        '#ffffff',
  navBorder:            '#e2e8f0',
  navActive:            'transparent',
  navInactive:          '#a0aec0',
  navHover:             '#f7fafc',
  exampleBackground:    '#f7fafc',
  exampleBorder:        '#667eea',
  toastBackground:      'rgba(0,0,0,0.8)',
  toastText:            '#ffffff',
  optionBackground:     '#f7fafc',
  optionHover:          '#667eea',
  loadingPrimary:       '#667eea',
  loadingSecondary:     '#e2e8f0',
};

const darkColors: ColorScheme = {
  background:           '#1a202c',
  cardBackground:       '#2d3748',
  text:                 '#e2e8f0',
  textSecondary:        '#a0aec0',
  textLight:            '#718096',
  headerBackground:     'transparent',
  headerText:           '#ffffff',
  primary:              '#667eea',
  primaryDark:          '#764ba2',
  secondary:            '#4facfe',
  secondaryLight:       '#00f2fe',
  accent1:              '#fc8181',
  accent2:              '#68d391',
  accent3:              '#63b3ed',
  accent4:              '#b794f6',
  border:               '#4a5568',
  borderLight:          '#2d3748',
  shadow:               'rgba(0,0,0,0.3)',
  shadowHover:          'rgba(0,0,0,0.4)',
  ripple:               'rgba(102, 126, 234, 0.4)',
  searchBackground:     'rgba(255,255,255,0.1)',
  searchBackgroundFocus:'rgba(255,255,255,0.2)',
  arabicText:           '#e2e8f0',
  bismillah:            '#667eea',
  navBackground:        '#2d3748',
  navBorder:            '#4a5568',
  navActive:            'transparent',
  navInactive:          '#718096',
  navHover:             '#4a5568',
  exampleBackground:    '#4a5568',
  exampleBorder:        '#667eea',
  toastBackground:      'rgba(0,0,0,0.9)',
  toastText:            '#ffffff',
  optionBackground:     '#4a5568',
  optionHover:          '#667eea',
  loadingPrimary:       '#667eea',
  loadingSecondary:     '#4a5568',
};

const lightGradients: GradientScheme = {
  body:            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  header:          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  cardIcon:        'linear-gradient(135deg, #667eea, #764ba2)',
  playButton:      'linear-gradient(135deg, #667eea, #764ba2)',
  playButtonActive:'linear-gradient(135deg, #e53e3e, #c53030)',
  navActive:       'linear-gradient(135deg, #667eea, #764ba2)',
  cardHover:       'linear-gradient(90deg, #667eea, #764ba2)',
  verseActive:     'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
  shimmer:         'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
};

const darkGradients: GradientScheme = {
  body:            'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
  header:          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  cardIcon:        'linear-gradient(135deg, #667eea, #764ba2)',
  playButton:      'linear-gradient(135deg, #667eea, #764ba2)',
  playButtonActive:'linear-gradient(135deg, #e53e3e, #c53030)',
  navActive:       'linear-gradient(135deg, #667eea, #764ba2)',
  cardHover:       'linear-gradient(90deg, #667eea, #764ba2)',
  verseActive:     'linear-gradient(135deg, #2d3748, #1a202c)',
  shimmer:         'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(saved => {
      if (saved !== null) setIsDarkMode(JSON.parse(saved));
    });
  }, []);

  const toggleDarkMode = async (): Promise<void> => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      colors:    isDarkMode ? darkColors    : lightColors,
      gradients: isDarkMode ? darkGradients : lightGradients,
      toggleDarkMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const Colors = {
  light:     lightColors,
  dark:      darkColors,
  gradients: { light: lightGradients, dark: darkGradients },
};
