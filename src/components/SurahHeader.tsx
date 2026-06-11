// components/SurahHeader.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, ColorScheme, GradientScheme } from '../contexts/ThemeContext';
import { useFonts } from '../contexts/FontContext';
import { Chapter } from '../services/quranAPI';
import TajweedLegend from './TajweedLegend';

interface Theme {
  colors:     ColorScheme;
  isDarkMode: boolean;
  gradients?: GradientScheme;
}

interface Props {
  surah:              Chapter;
  fontSize:           number;
  setFontSize:        (size: number) => void;
  showTranslation:    boolean;
  setShowTranslation: (show: boolean) => void;
  theme?:             Theme;
  minFontSize?:       number;
  maxFontSize?:       number;
}

export default function SurahHeader({
  surah, fontSize, setFontSize,
  showTranslation, setShowTranslation,
  theme, minFontSize = 12, maxFontSize = 32,
}: Props) {
  const contextTheme = useTheme();
  const { getArabicTextStyle } = useFonts();
  const { colors, isDarkMode } = theme ?? contextTheme;

  const [fadeAnim]   = useState(new Animated.Value(1));
  const [showLegend, setShowLegend] = useState(false);

  const flash = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.7, duration: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1,   duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const decreaseFontSize  = () => { flash(); setFontSize(Math.max(minFontSize, fontSize - 2)); };
  const increaseFontSize  = () => { flash(); setFontSize(Math.min(maxFontSize, fontSize + 2)); };
  const toggleTranslation = () => { flash(); setShowTranslation(!showTranslation); };

  const arabicName     = surah.name_arabic ?? 'سورة';
  const latinName      = surah.name_simple ?? 'Unknown';
  const translationName = surah.translated_name?.name ?? '';
  const revelationType  = surah.revelation_place ?? 'Unknown';
  const versesCount     = surah.verses_count ?? 0;
  const surahId         = surah.id ?? 0;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* ── Gradient hero ─────────────────────────────────────────────────── */}
      <LinearGradient
        colors={isDarkMode
          ? ['#2D3748', '#4A5568']
          : ['#667eea', '#7c3aed']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        {/* Surah label */}
        <Text style={styles.surahLabel}>SURAH KE-{surahId}</Text>

        {/* Arabic name */}
        <Text style={[getArabicTextStyle(32), styles.arabicName]}>{arabicName}</Text>

        {/* Latin name */}
        <Text style={styles.latinName}>{latinName}</Text>

        {/* Meta info */}
        <Text style={styles.metaInfo}>
          {translationName} · {versesCount} Ayat · {revelationType}
        </Text>

        {/* Play Murotal button */}
        <TouchableOpacity
          style={[styles.murattalBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <Ionicons name="play-circle-outline" size={18} color="#fff" />
          <Text style={styles.murattalText}>Putar Murotal</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Controls bar ──────────────────────────────────────────────────── */}
      <View style={[styles.controlsBar, {
        backgroundColor: colors.cardBackground,
        borderBottomColor: colors.border,
      }]}>
        {/* Font size controls */}
        <View style={styles.fontSizeGroup}>
          <TouchableOpacity
            onPress={decreaseFontSize}
            style={[styles.iconBtn, { backgroundColor: colors.background }]}
            disabled={fontSize <= minFontSize}
          >
            <Ionicons name="remove" size={18} color={fontSize <= minFontSize ? colors.textLight : colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.fontSizeLabel, { color: colors.textSecondary }]}>{fontSize}px</Text>
          <TouchableOpacity
            onPress={increaseFontSize}
            style={[styles.iconBtn, { backgroundColor: colors.background }]}
            disabled={fontSize >= maxFontSize}
          >
            <Ionicons name="add" size={18} color={fontSize >= maxFontSize ? colors.textLight : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Translation toggle */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={toggleTranslation}
          activeOpacity={0.75}
        >
          <Ionicons
            name={showTranslation ? 'text' : 'text-outline'}
            size={16}
            color={showTranslation ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.toggleLabel, {
            color: showTranslation ? colors.primary : colors.textSecondary,
          }]}>
            Terjemahan
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Tajwid legend */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setShowLegend(prev => !prev)}
          activeOpacity={0.75}
        >
          <Ionicons name="color-palette-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>Tajwid</Text>
        </TouchableOpacity>
      </View>

      {/* Tajwid Legend (collapsible) */}
      {showLegend && (
        <TajweedLegend />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Gradient header
  gradientHeader: {
    paddingTop:    32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems:    'center',
  },
  surahLabel: {
    color:         'rgba(255,255,255,0.7)',
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 1.2,
    marginBottom:  10,
  },
  arabicName: {
    color:      '#fff',
    textAlign:  'center',
    marginBottom: 6,
  },
  latinName: {
    color:        '#fff',
    fontSize:     26,
    fontWeight:   '700',
    marginBottom: 6,
  },
  metaInfo: {
    color:        'rgba(255,255,255,0.75)',
    fontSize:     13,
    marginBottom: 18,
  },
  murattalBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingHorizontal: 18,
    paddingVertical:   8,
    borderRadius:      20,
  },
  murattalText: {
    color:      '#fff',
    fontSize:   13,
    fontWeight: '600',
  },

  // Controls bar
  controlsBar: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 16,
    paddingVertical:   10,
    borderBottomWidth: 1,
    gap:            4,
  },
  fontSizeGroup: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    flex:          1,
  },
  iconBtn: {
    width:          30,
    height:         30,
    borderRadius:   15,
    justifyContent: 'center',
    alignItems:     'center',
  },
  fontSizeLabel: { fontSize: 12, fontWeight: '600', minWidth: 30, textAlign: 'center' },
  divider: {
    width:  1,
    height: 20,
    marginHorizontal: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  toggleLabel: { fontSize: 12, fontWeight: '500' },
});
