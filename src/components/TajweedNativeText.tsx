// components/TajweedNativeText.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform, TextStyle } from 'react-native';
import {
  parseTajweedToNativeSegments,
  getTajweedColor,
  BaseTajweedColors,
  TajweedColorKey,
} from '../utils/tajweedColors';
import { useFonts } from '../contexts/FontContext';
import { useTheme } from '../contexts/ThemeContext';
import { Verse } from '../services/quranAPI';

interface Props {
  verse:               Verse;
  fontSize?:           number;
  verseIndex?:         number;
  enableTajweedColors?: boolean;
  testID?:             string;
}

const getColorName = (colorValue: string): TajweedColorKey | 'unknown' | 'default' => {
  if (!colorValue) return 'default';
  const entry = Object.entries(BaseTajweedColors).find(([, v]) => v === colorValue);
  return entry ? (entry[0] as TajweedColorKey) : 'unknown';
};

const getEnhancedStyling = (colorName: TajweedColorKey | 'unknown' | 'default'): TextStyle => {
  const base: TextStyle = { textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 0.5 };

  switch (colorName) {
    case 'merah':    return { ...base, fontWeight: '500', textShadowColor: 'rgba(211,47,47,0.2)' };
    case 'magenta':  return { ...base, textShadowColor: 'rgba(156,39,176,0.2)' };
    case 'cyan':     return { ...base, textShadowColor: 'rgba(0,188,212,0.2)' };
    case 'hijau':    return { ...base, textShadowColor: 'rgba(76,175,80,0.2)' };
    case 'biru':     return { ...base, fontWeight: '500', textShadowColor: 'rgba(33,150,243,0.2)' };
    case 'abu_abu':  return { ...base, opacity: 0.6, textShadowColor: 'rgba(117,117,117,0.2)' };
    default:         return base;
  }
};

const TajweedNativeText = React.memo(({ verse, fontSize: propFontSize, verseIndex, enableTajweedColors = true, testID }: Props) => {
  const { arabicFont, fontSize: contextFontSize, getArabicTextStyle, isLoading: fontLoading } = useFonts();
  const { colors } = useTheme();
  const finalFontSize = propFontSize ?? contextFontSize;

  const arabicText = useMemo(() =>
    verse?.text_uthmani_tajweed ??
    verse?.text_uthmani ??
    '',
  [verse]);

  const textSegments = useMemo(() =>
    arabicText ? parseTajweedToNativeSegments(arabicText) : [],
  [arabicText]);

  const arabicTextStyle = useMemo(() => getArabicTextStyle(finalFontSize), [getArabicTextStyle, finalFontSize]);

  const baseTextStyle = useMemo((): TextStyle => ({
    ...arabicTextStyle,
    ...styles.baseText,
    fontSize:   finalFontSize,
    lineHeight: Math.max(finalFontSize * 2.2, finalFontSize + 16),
    color:      colors.text,
  }), [arabicTextStyle, finalFontSize, colors.text]);

  const buildSegmentStyle = (className: string | null, segmentStyle?: { color: string } | null): TextStyle => {
    const base: TextStyle = {
      ...styles.segmentText,
      fontFamily: arabicTextStyle?.fontFamily ?? 'System',
      fontSize:   finalFontSize,
      color:      colors.text,
    };

    if (!enableTajweedColors) return base;

    const tajweedStyle = segmentStyle ?? (className ? getTajweedColor(className) : null);
    if (tajweedStyle?.color) {
      const colorName = getColorName(tajweedStyle.color);
      return { ...base, color: tajweedStyle.color, ...getEnhancedStyling(colorName) };
    }
    return base;
  };

  if (!arabicText) return (
    <View style={styles.container}>
      <Text style={[baseTextStyle, { color: colors.textSecondary }]}>النص العربي غير متوفر</Text>
    </View>
  );

  if (fontLoading) return (
    <View style={styles.container}>
      <Text style={[baseTextStyle, { color: colors.textSecondary }]}>جاري التحميل...</Text>
    </View>
  );

  return (
    <View style={styles.container} testID={testID}>
      <Text style={baseTextStyle}>
        {textSegments.map((segment, index) => (
          <Text
            key={`${verseIndex ?? 0}-${index}-${segment.className ?? 'default'}`}
            style={buildSegmentStyle(segment.className, segment.style)}
          >
            {segment.text}
          </Text>
        ))}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 12, paddingHorizontal: 16, paddingVertical: 8 },
  baseText:  { textAlign: 'right', fontWeight: '400', letterSpacing: 0.8, ...(Platform.OS === 'android' && { includeFontPadding: false }) },
  segmentText: { letterSpacing: 0.6 },
});

export default TajweedNativeText;
