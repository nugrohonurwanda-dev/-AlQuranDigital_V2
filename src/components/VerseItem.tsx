// components/VerseItem.tsx
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TajweedDisplay from './TajweedDisplay';
import VerseAudio from './VerseAudio';
import { useAudio } from '../contexts/AudioContext';
import { useFonts } from '../contexts/FontContext';
import { useTheme, ColorScheme, GradientScheme } from '../contexts/ThemeContext';
import { Verse, Translation } from '../services/quranAPI';

interface Theme {
  colors:    ColorScheme;
  isDarkMode: boolean;
  gradients?: GradientScheme;
}

interface Props {
  verse:              Verse;
  translation?:       Translation;
  fontSize?:          number;
  showTranslation?:   boolean;
  index?:             number;
  isBookmarked?:      boolean;
  onToggleBookmark?:  (verse: Verse) => void;
  showActions?:       boolean;
  translationAuthor?: string;
  chapterNumber?:     number;
  showAudio?:         boolean;
  theme?:             Theme;
  onAudioPlaybackStart?: () => void;
  onAudioPlaybackEnd?:   () => void;
  onAudioPlaybackError?: (error: Error) => void;
}

// ─── BookmarkButton ───────────────────────────────────────────────────────────

interface BookmarkProps {
  verse:             Verse;
  isBookmarked:      boolean;
  onToggleBookmark?: (verse: Verse) => void;
  colors:            ColorScheme;
}

const BookmarkButton = ({ verse, isBookmarked, onToggleBookmark, colors }: BookmarkProps) => {
  const handlePress = useCallback(() => onToggleBookmark?.(verse), [verse, onToggleBookmark]);
  if (!onToggleBookmark) return null;
  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        {
          backgroundColor: isBookmarked ? colors.primary : 'transparent',
          borderColor:     isBookmarked ? colors.primary : colors.border,
        },
      ]}
      onPress={handlePress}
      accessibilityLabel={isBookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
    >
      <Ionicons
        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
        size={16}
        color={isBookmarked ? '#fff' : colors.primary}
      />
    </TouchableOpacity>
  );
};

// ─── VerseItem ────────────────────────────────────────────────────────────────

export default function VerseItem({
  verse, translation,
  fontSize: propFontSize = 28,
  showTranslation = true,
  index = 0,
  isBookmarked = false,
  onToggleBookmark,
  showActions = true,
  translationAuthor,
  chapterNumber,
  showAudio = true,
  theme,
  onAudioPlaybackStart,
  onAudioPlaybackEnd,
  onAudioPlaybackError,
}: Props) {
  const fontContext  = useFonts();
  const themeContext = useTheme();
  if (!fontContext || !themeContext) return null;

  const { fontSize: contextFontSize } = fontContext;
  const { colors } = theme ?? themeContext;
  const finalFontSize = propFontSize || contextFontSize || 28;

  if (!verse) return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <Text style={[styles.errorText, { color: colors.textSecondary }]}>Verse data not available</Text>
    </View>
  );

  const verseNumber          = verse.verse_number ?? (index + 1);
  const currentChapterNumber = chapterNumber ??
    (verse as Verse & { chapter_number?: number }).chapter_number ?? 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight }]}>

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.numberBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.numberText, { color: colors.headerText ?? '#fff' }]}>{verseNumber}</Text>
        </View>

        {showActions && (
          <View style={styles.actions}>
            {showAudio && (
              <VerseAudio
                chapterNumber={currentChapterNumber}
                verseNumber={verseNumber}
                size="small"
                onPlaybackStart={onAudioPlaybackStart}
                onPlaybackEnd={onAudioPlaybackEnd}
                onPlaybackError={onAudioPlaybackError}
              />
            )}
            <BookmarkButton
              verse={verse}
              isBookmarked={isBookmarked}
              onToggleBookmark={onToggleBookmark}
              colors={colors}
            />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.arabicContainer}>
          <TajweedDisplay verse={verse} fontSize={finalFontSize} verseIndex={index} />
        </View>

        {showTranslation && translation?.text && (
          <View style={[styles.translationContainer, { borderTopColor: colors.border }]}>
            <Text style={[styles.translationText, {
              fontSize:   Math.max(finalFontSize * 0.55, 14),
              color:      colors.textSecondary,
              lineHeight: Math.max(finalFontSize * 0.55, 14) * 1.4,
            }]}>
              {translation.text}
            </Text>
            {translationAuthor && (
              <Text style={[styles.translationAuthor, { color: colors.textLight }]}>
                — {translationAuthor}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical:   8,
    borderRadius:     12,
    padding:          16,
    borderWidth:      1,
    elevation:        2,
    shadowOffset:     { width: 0, height: 1 },
    shadowOpacity:    0.15,
    shadowRadius:     3,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  numberBadge: {
    borderRadius:    20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth:        40,
    alignItems:      'center',
    elevation:       1,
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.2,
    shadowRadius:    2,
  },
  numberText:           { fontSize: 14, fontWeight: '600' },
  actions:              { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: {
    borderRadius:  18,
    padding:       8,
    justifyContent: 'center',
    alignItems:    'center',
    minWidth:      36,
    minHeight:     36,
    borderWidth:   1,
    elevation:     1,
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius:  2,
  },
  content:              { flex: 1 },
  // letterSpacing dihapus dari arabicContainer — sudah dihandle di TajweedNativeText
  arabicContainer:      { paddingVertical: 4, marginBottom: 12 },
  translationContainer: { paddingTop: 12, borderTopWidth: 1, marginTop: 8 },
  translationText:      { textAlign: 'left', fontStyle: 'italic', marginBottom: 6 },
  translationAuthor:    { textAlign: 'right', fontSize: 12, fontStyle: 'normal', marginTop: 4 },
  errorText:            { textAlign: 'center', fontSize: 14, fontStyle: 'italic', padding: 16 },
});