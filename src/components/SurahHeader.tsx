// components/SurahHeader.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, ColorScheme, GradientScheme } from '../contexts/ThemeContext';
import { useFonts } from '../contexts/FontContext';
import { Chapter } from '../services/quranAPI';
import { TajweedColors } from '../utils/tajweedColors';
import TajweedLegend from './TajweedLegend';

const { width } = Dimensions.get('window');

interface Theme {
  colors:    ColorScheme;
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

  const [fadeAnim]    = useState(new Animated.Value(1));
  const [showLegend,  setShowLegend]  = useState(false);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1,   duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const decreaseFontSize   = () => { animatePress(); setFontSize(Math.max(minFontSize, fontSize - 2)); };
  const increaseFontSize   = () => { animatePress(); setFontSize(Math.min(maxFontSize, fontSize + 2)); };
  const toggleTranslation  = () => { animatePress(); setShowTranslation(!showTranslation); };
  const toggleLegend       = () => setShowLegend(prev => !prev);

  const arabicName    = surah.name_arabic ?? 'سورة';
  const latinName     = surah.name_simple ?? 'Unknown';
  const translation   = surah.translated_name?.name ?? '';
  const revelationType = surah.revelation_place ?? 'Unknown';
  const versesCount   = surah.verses_count ?? 0;

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border, opacity: fadeAnim }]}>

      {/* Gradient header */}
      <LinearGradient
        colors={isDarkMode ? ['#2D3748', '#4A5568', '#2D3748'] : ['#667eea', '#764ba2', '#667eea']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.nameCard}>
          <View style={styles.nameRow}>
            <View style={styles.latinSection}>
              <Text style={[styles.sectionLabel, { color: colors.headerText }]}>Latin</Text>
              <Text style={[styles.nameLatin, { color: colors.headerText }]}>{latinName}</Text>
            </View>

            <View style={styles.centerDivider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.headerText }]} />
              <View style={[styles.numberBadge, { backgroundColor: colors.headerText }]}>
                <Text style={[styles.numberText, { color: colors.primary }]}>{surah.id}</Text>
              </View>
              <View style={[styles.dividerLine, { backgroundColor: colors.headerText }]} />
            </View>

            <View style={styles.arabicSection}>
              <Text style={[styles.sectionLabel, { color: colors.headerText }]}>العربية</Text>
              <Text style={[styles.nameArabic, { color: colors.headerText, fontFamily: 'Amiri-Bold' }]}>{arabicName}</Text>
            </View>
          </View>
        </View>

        {translation ? (
          <Text style={[styles.translation, { color: colors.headerText }]}>"{translation}"</Text>
        ) : null}

        <View style={styles.infoRow}>
          <View style={styles.infoChip}>
            <Ionicons name="location-outline" size={14} color={colors.headerText} />
            <Text style={[styles.infoText, { color: colors.headerText }]}>{revelationType}</Text>
          </View>
          <View style={styles.infoChip}>
            <Ionicons name="list-outline" size={14} color={colors.headerText} />
            <Text style={[styles.infoText, { color: colors.headerText }]}>{versesCount} Ayat</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Bismillah */}
      {surah.id !== 9 && (
        <LinearGradient
          colors={isDarkMode ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.05)']}
          style={[styles.bismillahGradient, { backgroundColor: colors.exampleBackground }]}
        >
          <Text style={[getArabicTextStyle(24), styles.bismillahText, { color: colors.bismillah }]}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </Text>
          <Text style={[styles.bismillahTranslation, { color: colors.textSecondary }]}>
            "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang"
          </Text>
        </LinearGradient>
      )}

      {/* Controls */}
      <View style={[styles.controls, { backgroundColor: colors.background }]}>
        {/* Font size */}
        <View style={styles.fontControls}>
          <TouchableOpacity
            style={[styles.ctrlBtn, { backgroundColor: colors.optionBackground }]}
            onPress={decreaseFontSize} disabled={fontSize <= minFontSize}
          >
            <Ionicons name="remove" size={18} color={fontSize <= minFontSize ? colors.textLight : colors.textSecondary} />
            <Text style={[styles.ctrlText, { color: fontSize <= minFontSize ? colors.textLight : colors.textSecondary }]}>A</Text>
          </TouchableOpacity>

          <View style={[styles.fontSizeBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.fontSizeText, { color: colors.headerText }]}>{fontSize}</Text>
          </View>

          <TouchableOpacity
            style={[styles.ctrlBtn, { backgroundColor: colors.optionBackground }]}
            onPress={increaseFontSize} disabled={fontSize >= maxFontSize}
          >
            <Ionicons name="add" size={18} color={fontSize >= maxFontSize ? colors.textLight : colors.textSecondary} />
            <Text style={[styles.ctrlText, { color: fontSize >= maxFontSize ? colors.textLight : colors.textSecondary }]}>A</Text>
          </TouchableOpacity>
        </View>

        {/* Feature buttons */}
        <View style={styles.featureControls}>
          <TouchableOpacity
            style={[styles.featureBtn, { backgroundColor: showTranslation ? colors.primary : colors.optionBackground }]}
            onPress={toggleTranslation}
          >
            <Ionicons name="language" size={20} color={showTranslation ? colors.headerText : colors.textSecondary} />
            <Text style={[styles.featureText, { color: showTranslation ? colors.headerText : colors.textSecondary }]}>Terjemah</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.featureBtn, { backgroundColor: showLegend ? colors.primary : colors.optionBackground }]}
            onPress={toggleLegend}
          >
            <Ionicons name="color-palette" size={20} color={showLegend ? colors.headerText : colors.textSecondary} />
            <Text style={[styles.featureText, { color: showLegend ? colors.headerText : colors.textSecondary }]}>Tajweed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showLegend && <TajweedLegend />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container:          { borderBottomWidth: 1, elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  headerGradient:     { paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' },
  nameCard:           { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', elevation: 5, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
  nameRow:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  latinSection:       { flex: 1, alignItems: 'center' },
  arabicSection:      { flex: 1, alignItems: 'center' },
  centerDivider:      { alignItems: 'center', paddingHorizontal: 15 },
  dividerLine:        { width: 30, height: 2, borderRadius: 1, opacity: 0.6 },
  numberBadge:        { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginVertical: 8, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  numberText:         { fontSize: 16, fontWeight: 'bold' },
  sectionLabel:       { fontSize: 12, fontWeight: '600', opacity: 0.8, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  nameLatin:          { fontSize: 18, fontWeight: '700', textAlign: 'center', lineHeight: 24 },
  nameArabic:         { fontSize: 24, fontWeight: 'bold', textAlign: 'center', lineHeight: 32 },
  translation:        { fontSize: 16, textAlign: 'center', fontStyle: 'italic', marginBottom: 16, opacity: 0.9 },
  infoRow:            { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  infoChip:           { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  infoText:           { fontSize: 14, fontWeight: '600' },
  bismillahGradient:  { padding: 24, alignItems: 'center' },
  bismillahText:      { textAlign: 'center', marginBottom: 8 },
  bismillahTranslation: { fontSize: 12, textAlign: 'center', fontStyle: 'italic', opacity: 0.7, color: '#666' },
  controls:           { paddingVertical: 16, paddingHorizontal: 20, gap: 16 },
  fontControls:       { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  featureControls:    { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  ctrlBtn:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 25, minWidth: 50, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  ctrlText:           { marginLeft: 4, fontSize: 12, fontWeight: '600' },
  fontSizeBadge:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, minWidth: 40, alignItems: 'center' },
  fontSizeText:       { fontSize: 14, fontWeight: 'bold' },
  featureBtn:         { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16, borderRadius: 25, minWidth: 100, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  featureText:        { marginLeft: 6, fontSize: 12, fontWeight: '600' },
});
