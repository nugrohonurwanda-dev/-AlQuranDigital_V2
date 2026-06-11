// components/VerseItem.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, Pressable,
  StyleSheet, Share, Animated, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TajweedDisplay from './TajweedDisplay';
import VerseAudio from './VerseAudio';
import { useAudio } from '../contexts/AudioContext';
import { useFonts } from '../contexts/FontContext';
import { useTheme, ColorScheme, GradientScheme } from '../contexts/ThemeContext';
import { Verse, Translation } from '../services/quranAPI';
import { copyToClipboard } from '../utils/clipboard';

interface Theme {
  colors:     ColorScheme;
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

// ─── Verse number badge ───────────────────────────────────────────────────────

const VerseBadge: React.FC<{ number: number; colors: ColorScheme }> = ({ number, colors }) => (
  <View style={[
    badge.wrap,
    { borderColor: colors.primary + '45', backgroundColor: colors.primary + '12' },
  ]}>
    <Text style={[badge.num, { color: colors.primary }]}>{number}</Text>
  </View>
);

const badge = StyleSheet.create({
  wrap: {
    width:          34,
    height:         34,
    borderRadius:   17,
    borderWidth:    1.5,
    justifyContent: 'center',
    alignItems:     'center',
    flexShrink:     0,
  },
  num: { fontSize: 12, fontWeight: '700' },
});

// ─── Action bar (copy / share / bookmark) ────────────────────────────────────

interface ActionBarProps {
  verse:             Verse;
  translation?:      Translation;
  isBookmarked:      boolean;
  onToggleBookmark?: (verse: Verse) => void;
  colors:            ColorScheme;
  onDismiss:         () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  verse, translation, isBookmarked, onToggleBookmark, colors, onDismiss,
}) => {
  const [copied, setCopied] = useState(false);

  const arabicText  = verse.text_uthmani ?? '';
  const transText   = translation?.text ?? '';
  const verseRef    = verse.verse_key ?? '';
  const fullText    = `${arabicText}\n\n${transText}\n— ${verseRef}`;

  const handleCopy = useCallback(async () => {
    const result = await copyToClipboard(fullText);
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => { setCopied(false); onDismiss(); }, 1800);
    }
  }, [fullText, onDismiss]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({ message: fullText, title: `Al-Qur\'an ${verseRef}` });
      onDismiss();
    } catch {}
  }, [fullText, verseRef, onDismiss]);

  const handleBookmark = useCallback(() => {
    onToggleBookmark?.(verse);
    onDismiss();
  }, [verse, onToggleBookmark, onDismiss]);

  const ActionBtn = ({
    icon, label, onPress, active = false,
  }: { icon: string; label: string; onPress: () => void; active?: boolean }) => (
    <TouchableOpacity
      style={[ab.btn, { backgroundColor: active ? colors.primary + '18' : 'transparent' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon as React.ComponentProps<typeof Ionicons>['name']}
        size={18}
        color={active ? colors.primary : colors.textSecondary}
      />
      <Text style={[ab.label, { color: active ? colors.primary : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[ab.row, { borderTopColor: colors.borderLight }]}>
      <ActionBtn
        icon={copied ? 'checkmark-circle' : 'copy-outline'}
        label={copied ? 'Disalin!' : 'Salin'}
        onPress={handleCopy}
        active={copied}
      />
      <View style={[ab.divider, { backgroundColor: colors.borderLight }]} />
      <ActionBtn icon="share-social-outline" label="Bagikan" onPress={handleShare} />
      {onToggleBookmark && (
        <>
          <View style={[ab.divider, { backgroundColor: colors.borderLight }]} />
          <ActionBtn
            icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            label={isBookmarked ? 'Tersimpan' : 'Tandai'}
            onPress={handleBookmark}
            active={isBookmarked}
          />
        </>
      )}
    </View>
  );
};

const ab = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    marginTop:      14,
    paddingTop:     10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  btn: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius:   8,
    gap:            4,
  },
  label:   { fontSize: 11, fontWeight: '600' },
  divider: { width: 1, height: 28 },
});

// ─── Bismillah row (verse_number === 1, special centered display) ─────────────

interface BismillahProps {
  verse:     Verse;
  fontSize:  number;
  colors:    ColorScheme;
  showAudio: boolean;
  chapterNumber: number;
  onAudioPlaybackStart?: () => void;
  onAudioPlaybackEnd?:   () => void;
  onAudioPlaybackError?: (error: Error) => void;
}

const BismillahVerse: React.FC<BismillahProps> = ({
  verse, fontSize, colors, showAudio, chapterNumber,
  onAudioPlaybackStart, onAudioPlaybackEnd, onAudioPlaybackError,
}) => (
  <View style={[bv.container, { borderBottomColor: colors.borderLight }]}>
    <View style={bv.arabic}>
      <TajweedDisplay
        verse={verse}
        fontSize={fontSize + 2}
        verseIndex={0}
      />
    </View>
    {showAudio && (
      <View style={bv.audio}>
        <VerseAudio
          chapterNumber={chapterNumber}
          verseNumber={1}
          size="small"
          onPlaybackStart={onAudioPlaybackStart}
          onPlaybackEnd={onAudioPlaybackEnd}
          onPlaybackError={onAudioPlaybackError}
        />
      </View>
    )}
  </View>
);

const bv = StyleSheet.create({
  container: {
    alignItems:      'center',
    paddingVertical:  24,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    position:         'relative',
  },
  arabic: { width: '100%', alignItems: 'center' },
  audio:  { marginTop: 12 },
});

// ─── Main VerseItem ────────────────────────────────────────────────────────────

export default function VerseItem({
  verse,
  translation,
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

  const { fontSize: contextFontSize }     = fontContext;
  const { colors, isDarkMode }            = theme ?? themeContext;
  const finalFontSize                     = propFontSize || contextFontSize || 28;

  const [expanded, setExpanded] = useState(false);
  const highlightAnim           = useState(new Animated.Value(0))[0];

  if (!verse) return (
    <View style={[styles.errorWrap, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.errorText, { color: colors.textSecondary }]}>
        Verse data not available
      </Text>
    </View>
  );

  const verseNumber          = verse.verse_number ?? (index + 1);
  const currentChapterNumber = chapterNumber ??
    (verse as Verse & { chapter_number?: number }).chapter_number ?? 1;

  // ── Bismillah treatment for verse 1 ──────────────────────────────────────
  const isBismillah = verseNumber === 1;
  if (isBismillah) {
    return (
      <BismillahVerse
        verse={verse}
        fontSize={finalFontSize}
        colors={colors}
        showAudio={showAudio && showActions}
        chapterNumber={currentChapterNumber}
        onAudioPlaybackStart={onAudioPlaybackStart}
        onAudioPlaybackEnd={onAudioPlaybackEnd}
        onAudioPlaybackError={onAudioPlaybackError}
      />
    );
  }

  // ── Tap handler ─────────────────────────────────────────────────────────
  const handlePress = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    Animated.timing(highlightAnim, {
      toValue:         newExpanded ? 1 : 0,
      duration:        200,
      useNativeDriver: false,
    }).start();
  };

  const bgColor = highlightAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [
      isDarkMode ? 'transparent' : 'transparent',
      colors.primary + '0C',
    ],
  });

  const isOdd = index % 2 !== 0;

  return (
    <Pressable onPress={handlePress} accessibilityRole="button"
      accessibilityLabel={`Ayat ${verseNumber}`}>
      <Animated.View style={[
        styles.container,
        {
          backgroundColor:   expanded
            ? bgColor as any
            : (isOdd
               ? (isDarkMode ? colors.cardBackground + 'aa' : '#F9FAFB')
               : 'transparent'),
          borderBottomColor: colors.borderLight,
        },
      ]}>

        {/* ── Header: badge + audio ── */}
        <View style={styles.headerRow}>
          {showActions ? (
            <VerseBadge number={verseNumber} colors={colors} />
          ) : (
            <View style={styles.badgePlaceholder} />
          )}

          <View style={styles.headerRight}>
            {showActions && showAudio && (
              <VerseAudio
                chapterNumber={currentChapterNumber}
                verseNumber={verseNumber}
                size="small"
                onPlaybackStart={onAudioPlaybackStart}
                onPlaybackEnd={onAudioPlaybackEnd}
                onPlaybackError={onAudioPlaybackError}
              />
            )}
            {showActions && (
              <TouchableOpacity
                onPress={handlePress}
                style={[styles.moreBtn, { backgroundColor: colors.background }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={expanded ? 'chevron-up' : 'ellipsis-horizontal'}
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Arabic text ── */}
        <View style={styles.arabicWrap}>
          <TajweedDisplay
            verse={verse}
            fontSize={finalFontSize}
            verseIndex={index}
          />
        </View>

        {/* ── Translation ── */}
        {showTranslation && translation?.text && (
          <View style={[styles.transWrap, { borderTopColor: colors.borderLight }]}>
            <Text style={[styles.transText, {
              color:      colors.textSecondary,
              fontSize:   Math.max(finalFontSize * 0.54, 14),
              lineHeight: Math.max(finalFontSize * 0.54, 14) * 1.55,
            }]}>
              {translation.text}
            </Text>
            {translationAuthor && (
              <Text style={[styles.transAuthor, { color: colors.textLight }]}>
                — {translationAuthor}
              </Text>
            )}
          </View>
        )}

        {/* ── Action bar (visible when expanded) ── */}
        {expanded && showActions && (
          <ActionBar
            verse={verse}
            translation={translation}
            isBookmarked={isBookmarked}
            onToggleBookmark={onToggleBookmark}
            colors={colors}
            onDismiss={() => {
              setExpanded(false);
              Animated.timing(highlightAnim, {
                toValue: 0, duration: 200, useNativeDriver: false,
              }).start();
            }}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  errorWrap: {
    marginHorizontal: 16,
    marginVertical:   8,
    borderRadius:     12,
    padding:          16,
  },
  errorText: {
    textAlign:  'center',
    fontSize:   14,
    fontStyle:  'italic',
  },

  container: {
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  headerRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  badgePlaceholder: { width: 34 },
  moreBtn: {
    width:          30,
    height:         30,
    borderRadius:   15,
    justifyContent: 'center',
    alignItems:     'center',
  },

  arabicWrap: {
    marginBottom: 0,
  },

  transWrap: {
    paddingTop:  12,
    marginTop:   10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  transText:   { fontStyle: 'italic' },
  transAuthor: {
    textAlign:  'right',
    fontSize:   12,
    marginTop:  6,
  },
});
