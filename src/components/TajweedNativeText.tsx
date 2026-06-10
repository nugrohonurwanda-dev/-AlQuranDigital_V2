// components/TajweedNativeText.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform, TextStyle } from 'react-native';
import { getTajweedColor } from '../utils/tajweedColors';
import { useFonts } from '../contexts/FontContext';
import { useTheme } from '../contexts/ThemeContext';
import { Verse } from '../services/quranAPI';

interface Props {
  verse:                Verse;
  fontSize?:            number;
  verseIndex?:          number;
  enableTajweedColors?: boolean;
  testID?:              string;
}

// ─── Parse warna tajweed per-kata dari HTML tajweed ───────────────────────────
// Strategi: ekstrak pasangan (kata → warna) dari text_uthmani_tajweed,
// lalu terapkan ke kata-kata di text_uthmani yang bersih.
// Dengan begitu rendering pakai teks bersih (huruf menyambung),
// tapi masih dapat info warna dari HTML tajweed.

interface WordColor {
  word: string;
  color: string | null;
}

function buildWordColorMap(tajweedHtml: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!tajweedHtml) return map;

  // Ekstrak semua segment bertag: <tag class="...">teks</tag>
  const tagRegex = /<\w+(?:\s+[^>]*?)?>([^<]*)<\/\w+>/gi;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(tajweedHtml)) !== null) {
    const [fullMatch, content] = match;
    const cleanContent = content.replace(/\s+/g, '').trim();
    if (!cleanContent) continue;

    // Ambil class attribute
    const classMatch = fullMatch.match(/class\s*=\s*["']?([^"'\s>]+)["']?/i);
    if (!classMatch) continue;

    const tajweedStyle = getTajweedColor(classMatch[1]);
    if (tajweedStyle?.color) {
      map.set(cleanContent, tajweedStyle.color);
    }
  }

  return map;
}

// Pecah text_uthmani bersih jadi kata-kata, dengan warna dari map
function buildColoredWords(cleanText: string, colorMap: Map<string, string>): WordColor[] {
  if (!cleanText) return [];

  // Pecah per spasi, pertahankan spasi sebagai separator
  const words = cleanText.split(/(\s+)/);

  return words.map(word => {
    if (!word.trim()) return { word, color: null }; // spasi
    // Cari warna — coba exact match dulu, lalu strip harakat untuk fuzzy match
    const stripped = word.replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '');
    const color = colorMap.get(word) ?? colorMap.get(stripped) ?? null;
    return { word, color };
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

const TajweedNativeText = React.memo(({
  verse,
  fontSize: propFontSize,
  verseIndex,
  enableTajweedColors = true,
  testID,
}: Props) => {
  const { fontSize: contextFontSize, getArabicTextStyle, isLoading: fontLoading } = useFonts();
  const { colors } = useTheme();
  const finalFontSize = propFontSize ?? contextFontSize;

  // Gunakan text_uthmani BERSIH sebagai teks render utama
  const cleanText = useMemo(() =>
    verse?.text_uthmani ?? verse?.text_uthmani_tajweed?.replace(/<[^>]*>/g, '') ?? '',
  [verse]);

  // Gunakan text_uthmani_tajweed hanya untuk ekstrak info warna
  const tajweedHtml = useMemo(() =>
    verse?.text_uthmani_tajweed ?? '',
  [verse]);

  const arabicTextStyle = useMemo(
    () => getArabicTextStyle(finalFontSize),
    [getArabicTextStyle, finalFontSize],
  );

  const baseTextStyle = useMemo((): TextStyle => ({
    ...arabicTextStyle,
    fontSize:         finalFontSize,
    lineHeight:       Math.max(finalFontSize * 2.0, finalFontSize + 20),
    color:            colors.text,
    textAlign:        'right',
    writingDirection: 'rtl',
    letterSpacing:    0,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  }), [arabicTextStyle, finalFontSize, colors.text]);

  // Map kata → warna dari HTML tajweed
  const colorMap = useMemo(() =>
    enableTajweedColors ? buildWordColorMap(tajweedHtml) : new Map<string, string>(),
  [tajweedHtml, enableTajweedColors]);

  // Daftar kata dengan warnanya
  const coloredWords = useMemo(() =>
    buildColoredWords(cleanText, colorMap),
  [cleanText, colorMap]);

  if (!cleanText) return (
    <View style={styles.container}>
      <Text style={[baseTextStyle, { color: colors.textSecondary }]}>النص العربي غير متوفر</Text>
    </View>
  );

  if (fontLoading) return (
    <View style={styles.container}>
      <Text style={[baseTextStyle, { color: colors.textSecondary }]}>جاري التحميل...</Text>
    </View>
  );

  // Kalau tajweed OFF atau tidak ada warna sama sekali → render satu Text tunggal
  // Ini kondisi paling optimal untuk joining huruf Arab
  if (!enableTajweedColors || colorMap.size === 0) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={baseTextStyle}>{cleanText}</Text>
      </View>
    );
  }

  // Kalau tajweed ON → render per-kata, bukan per-karakter
  // Kata = unit terkecil yang kita split, sehingga huruf dalam satu kata
  // selalu berada dalam satu Text node → pasti menyambung
  const segmentStyle = (color: string | null): TextStyle => ({
    fontFamily:    arabicTextStyle?.fontFamily ?? 'System',
    fontSize:      finalFontSize,
    letterSpacing: 0,
    color:         color ?? colors.text,
  });

  return (
    <View style={styles.container} testID={testID}>
      <Text style={baseTextStyle}>
        {coloredWords.map((item, index) => (
          <Text
            key={`${verseIndex ?? 0}-w${index}`}
            style={segmentStyle(item.color)}
          >
            {item.word}
          </Text>
        ))}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom:     12,
    paddingHorizontal: 16,
    paddingVertical:   8,
  },
});

export default TajweedNativeText;