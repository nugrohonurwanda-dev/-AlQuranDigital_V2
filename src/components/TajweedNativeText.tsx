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
// Strategi: parse tajweedHtml karakter per karakter untuk membangun
// Map<wordIndex, color>. Word index naik setiap kali ada spasi di luar tag.
// Lalu pasangkan index itu ke kata-kata di cleanText (text_uthmani bersih).
// Ini menghindari masalah lama: "fragment key ≠ whole word".

interface WordColor {
  word: string;
  color: string | null;
}

// Tanda baca Quran (pause mark: ۗ ۖ dsb) yang muncul sebagai token tersendiri
// di cleanText tapi tidak dihitung sebagai kata di tajweedHtml
const PAUSE_MARK_RE = /^[\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0600-\u0605\uFDFD\u0615]+$/;

function buildWordColorMapByIndex(tajweedHtml: string): Map<number, string> {
  const map = new Map<number, string>();
  if (!tajweedHtml) return map;

  // Buang <span class=end>…</span> (nomor ayat) agar tidak ikut dihitung
  const html = tajweedHtml.replace(/<span[^>]*>[\s\S]*?<\/span>/gi, '').trim();

  let wordIdx = 0;
  let inTag = false;
  let tagBuffer = '';
  let currentColor: string | null = null;
  let prevWasSpace = true;

  for (let i = 0; i < html.length; i++) {
    const ch = html[i];

    if (ch === '<') {
      inTag = true;
      tagBuffer = '<';
    } else if (inTag) {
      tagBuffer += ch;
      if (ch === '>') {
        inTag = false;
        if (tagBuffer.startsWith('</')) {
          currentColor = null;
        } else {
          const cm = tagBuffer.match(/class\s*=\s*["']?([^"'\s>]+)["']?/i);
          if (cm) {
            const style = getTajweedColor(cm[1]);
            currentColor = style?.color ?? null;
          } else {
            currentColor = null;
          }
        }
        tagBuffer = '';
      }
    } else {
      // Karakter konten (di luar tag)
      const isSpace = ch === ' ' || ch === '\u00a0';
      if (isSpace) {
        if (!prevWasSpace) wordIdx++;
        prevWasSpace = true;
      } else {
        prevWasSpace = false;
        // Simpan warna pertama yang ditemukan untuk kata ini
        if (currentColor && !map.has(wordIdx)) {
          map.set(wordIdx, currentColor);
        }
      }
    }
  }

  return map;
}

// Pecah cleanText jadi kata-kata dan pasangkan dengan warna dari index map.
// Pause mark di-skip dari penomoran agar index selaras dengan tajweedHtml.
function buildColoredWords(cleanText: string, colorMap: Map<number, string>): WordColor[] {
  if (!cleanText) return [];

  const parts = cleanText.split(/([\s]+)/);
  let wordIdx = 0;

  return parts.map(part => {
    if (!part || /^\s+$/.test(part)) return { word: part, color: null };
    if (PAUSE_MARK_RE.test(part)) return { word: part, color: null };
    const color = colorMap.get(wordIdx) ?? null;
    wordIdx++;
    return { word: part, color };
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

  // Map wordIndex → warna dari HTML tajweed
  const colorMap = useMemo(() =>
    enableTajweedColors ? buildWordColorMapByIndex(tajweedHtml) : new Map<number, string>(),
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