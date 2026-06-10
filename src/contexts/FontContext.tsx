// contexts/FontContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, TextStyle } from 'react-native';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FontWeight = 'normal' | 'bold';
export type FontName   = 'Amiri' | 'Lateef' | 'ScheherazadeNew' | 'System';

export interface FontConfig {
  name: FontName;
  label: string;
  preview: string;
  regular: number | null;
  bold: number | null;
  description: string;
}

export interface FontContextType {
  arabicFont:    FontName;
  fontSize:      number;
  fontWeight:    FontWeight;
  fontsLoaded:   boolean;
  isLoading:     boolean;
  availableFonts: FontConfig[];
  fontWeights:   { NORMAL: FontWeight; BOLD: FontWeight };
  updateArabicFont:   (name: FontName) => Promise<boolean>;
  updateFontSize:     (size: number)   => Promise<boolean>;
  updateFontWeight:   (weight: FontWeight) => Promise<boolean>;
  getArabicTextStyle: (size?: number | null, weight?: FontWeight | null) => TextStyle;
  getTransliterationStyle: (size?: number | null, weight?: FontWeight | null) => TextStyle;
  getFontFamilyName:  (name?: FontName, weight?: FontWeight) => string;
  getCurrentFontInfo: () => FontConfig;
  hasBoldVariant:     (name?: FontName) => boolean;
  resetToDefaults:    () => Promise<boolean>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const FONT_WEIGHTS = { NORMAL: 'normal' as FontWeight, BOLD: 'bold' as FontWeight };

const AVAILABLE_FONTS: FontConfig[] = [
  {
    name:        'Amiri',
    label:       'Amiri (Recommended)',
    preview:     'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    regular:     require('../../assets/fonts/Amiri-Regular.ttf'),
    bold:        require('../../assets/fonts/Amiri-Bold.ttf'),
    description: 'Font klasik dengan keterbacaan tinggi',
  },
  {
    name:        'Lateef',
    label:       'Lateef',
    preview:     'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    regular:     require('../../assets/fonts/Lateef-Regular.ttf'),
    bold:        require('../../assets/fonts/Lateef-Bold.ttf'),
    description: 'Font modern dengan desain yang elegan',
  },
  {
    name:        'ScheherazadeNew',
    label:       'Scheherazade New',
    preview:     'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    regular:     require('../../assets/fonts/ScheherazadeNew-Regular.ttf'),
    bold:        require('../../assets/fonts/ScheherazadeNew-Bold.ttf'),
    description: 'Font dengan gaya kaligrafi tradisional',
  },
  {
    name:        'System',
    label:       'Font Sistem',
    preview:     'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    regular:     null,
    bold:        null,
    description: 'Menggunakan font sistem default',
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const FontContext = createContext<FontContextType | undefined>(undefined);

export const useFonts = (): FontContextType => {
  const context = useContext(FontContext);
  if (!context) throw new Error('useFonts must be used within a FontProvider');
  return context;
};

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontsLoaded,  setFontsLoaded]  = useState(false);
  const [arabicFont,   setArabicFont]   = useState<FontName>('Amiri');
  const [fontSize,     setFontSize]     = useState(18);
  const [fontWeight,   setFontWeight]   = useState<FontWeight>(FONT_WEIGHTS.NORMAL);
  const [isLoading,    setIsLoading]    = useState(true);

  useEffect(() => {
    loadFonts();
    loadSettings();
  }, []);

  const loadFonts = async () => {
    try {
      const fontMap: Record<string, number> = {};
      AVAILABLE_FONTS.forEach(font => {
        if (font.regular && font.bold) {
          fontMap[font.name]          = font.regular;
          fontMap[`${font.name}-Bold`] = font.bold;
        }
      });
      await Font.loadAsync(fontMap);
      setFontsLoaded(true);
    } catch {
      setArabicFont('System');
      setFontsLoaded(true);
    }
  };

  const loadSettings = async () => {
    try {
      const [savedFont, savedSize, savedWeight] = await Promise.all([
        AsyncStorage.getItem('arabicFont'),
        AsyncStorage.getItem('fontSize'),
        AsyncStorage.getItem('fontWeight'),
      ]);
      if (savedFont && AVAILABLE_FONTS.find(f => f.name === savedFont)) {
        setArabicFont(savedFont as FontName);
      }
      if (savedSize) setFontSize(parseInt(savedSize, 10));
      if (savedWeight && Object.values(FONT_WEIGHTS).includes(savedWeight as FontWeight)) {
        setFontWeight(savedWeight as FontWeight);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateArabicFont = async (fontName: FontName): Promise<boolean> => {
    if (!AVAILABLE_FONTS.find(f => f.name === fontName)) return false;
    setArabicFont(fontName);
    await AsyncStorage.setItem('arabicFont', fontName);
    return true;
  };

  const updateFontSize = async (size: number): Promise<boolean> => {
    const valid = Math.max(12, Math.min(32, size));
    setFontSize(valid);
    await AsyncStorage.setItem('fontSize', valid.toString());
    return true;
  };

  const updateFontWeight = async (weight: FontWeight): Promise<boolean> => {
    if (!Object.values(FONT_WEIGHTS).includes(weight)) return false;
    setFontWeight(weight);
    await AsyncStorage.setItem('fontWeight', weight);
    return true;
  };

  const getFontFamilyName = (
    fontName: FontName = arabicFont,
    weight:   FontWeight = fontWeight,
  ): string => {
    if (fontName === 'System') return Platform.OS === 'ios' ? 'Arial' : 'normal';
    if (weight === FONT_WEIGHTS.BOLD) {
      const cfg = AVAILABLE_FONTS.find(f => f.name === fontName);
      if (cfg?.bold) return `${fontName}-Bold`;
    }
    return fontName;
  };

  const getArabicTextStyle = (
    customSize:   number | null = null,
    customWeight: FontWeight | null = null,
  ): TextStyle => {
    const size   = customSize   ?? fontSize;
    const weight = customWeight ?? fontWeight;
    return {
      fontFamily:      getFontFamilyName(arabicFont, weight),
      fontSize:        size,
      lineHeight:      size * 1.5,
      textAlign:       'right',
      writingDirection:'rtl',
      fontWeight:      arabicFont === 'System' ? weight : 'normal',
    };
  };

  const getTransliterationStyle = (
    customSize:   number | null = null,
    customWeight: FontWeight | null = null,
  ): TextStyle => {
    const size   = customSize ? customSize * 0.85 : fontSize * 0.85;
    const weight = customWeight ?? fontWeight;
    return {
      fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
      fontSize:   size,
      lineHeight: size * 1.4,
      fontStyle:  'italic',
      fontWeight: weight,
    };
  };

  const getCurrentFontInfo = (): FontConfig =>
    AVAILABLE_FONTS.find(f => f.name === arabicFont) ?? AVAILABLE_FONTS[0];

  const hasBoldVariant = (fontName: FontName = arabicFont): boolean =>
    !!(AVAILABLE_FONTS.find(f => f.name === fontName)?.bold);

  const resetToDefaults = async (): Promise<boolean> => {
    setArabicFont('Amiri');
    setFontSize(18);
    setFontWeight(FONT_WEIGHTS.NORMAL);
    await AsyncStorage.multiRemove(['arabicFont', 'fontSize', 'fontWeight']);
    return true;
  };

  return (
    <FontContext.Provider value={{
      arabicFont, fontSize, fontWeight, fontsLoaded, isLoading,
      availableFonts: AVAILABLE_FONTS,
      fontWeights:    FONT_WEIGHTS,
      updateArabicFont, updateFontSize, updateFontWeight,
      getArabicTextStyle, getTransliterationStyle, getFontFamilyName,
      getCurrentFontInfo, hasBoldVariant, resetToDefaults,
    }}>
      {children}
    </FontContext.Provider>
  );
};
