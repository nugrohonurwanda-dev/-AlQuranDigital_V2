// components/CompactMusicPlayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTheme } from '../contexts/ThemeContext';
import { useFonts } from '../contexts/FontContext';
import { useAudio } from '../contexts/AudioContext';
import { Verse, Translation } from '../services/quranAPI';

interface ChapterData {
  id:              number | string;
  name?:           string;
  name_simple?:    string;
  name_complex?:   string;
  translated_name?: { name?: string };
  verses?: (Verse & { translation?: Translation })[];
}

interface Props {
  navigation?: unknown;
  chapterData?: ChapterData;
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function CompactMusicPlayer({ chapterData }: Props) {
  const { colors }              = useTheme();
  const { getArabicTextStyle }  = useFonts();
  const {
    isPlaying, currentVerse, isLoading, hasError,
    playVerseAudio, stopAudio, pauseAudio, resumeAudio,
    getCurrentReciterName,
  } = useAudio();

  const [isExpanded,    setIsExpanded]    = useState(false);
  const [isVisible,     setIsVisible]     = useState(false);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [duration,      setDuration]      = useState(0);
  const [currentChapter, setCurrentChapter] = useState<ChapterData | null>(null);

  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (currentVerse && chapterData) {
      setCurrentChapter(chapterData);
      if (!isVisible) {
        setIsVisible(true);
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 100, friction: 8 }).start();
      }
    } else if (isVisible) {
      Animated.spring(slideAnim, { toValue: 100, useNativeDriver: true, tension: 100, friction: 8 }).start(() => {
        setIsVisible(false);
        setCurrentChapter(null);
      });
    }
  }, [currentVerse, chapterData, isVisible]);

  const handlePlayPause = async () => {
    try {
      isPlaying ? await pauseAudio() : await resumeAudio();
    } catch { /* noop */ }
  };

  const handleNext = async () => {
    if (!currentVerse || !currentChapter?.verses) return;
    const nextNum  = currentVerse.verseNumber + 1;
    const hasVerse = nextNum <= (currentChapter.verses.length);
    if (hasVerse) await playVerseAudio(currentVerse.chapterNumber, nextNum).catch(() => {});
  };

  const handlePrevious = async () => {
    if (!currentVerse || currentVerse.verseNumber <= 1) return;
    await playVerseAudio(currentVerse.chapterNumber, currentVerse.verseNumber - 1).catch(() => {});
  };

  const getCurrentInfo = () => {
    if (!currentVerse || !currentChapter) return { title: 'Tidak ada audio', subtitle: 'Pilih ayat untuk memutar', arabicText: '' };
    const verseData = currentChapter.verses?.find(v => v.verse_number === currentVerse.verseNumber);
    return {
      title:      `${currentChapter.name_simple ?? 'Surah'} - Ayat ${currentVerse.verseNumber}`,
      subtitle:   currentChapter.translated_name?.name ?? getCurrentReciterName(),
      arabicText: verseData?.text_uthmani ?? '',
    };
  };

  const info = getCurrentInfo();
  const canPrev = !!currentVerse && currentVerse.verseNumber > 1;
  const canNext = !!currentVerse && !!currentChapter?.verses && currentVerse.verseNumber < (currentChapter.verses.length);

  if (!isVisible) return null;

  const PlayIcon = isLoading ? 'hourglass' : hasError ? 'alert-circle' : isPlaying ? 'pause' : 'play';

  return (
    <>
      {/* Compact bar */}
      <Animated.View
        testID="compact-player"
        style={[styles.container, { backgroundColor: colors.cardBackground, borderTopColor: colors.border, transform: [{ translateY: slideAnim }] }]}
      >
        <TouchableOpacity testID="player-content" style={styles.playerContent} onPress={() => setIsExpanded(true)} activeOpacity={0.9}>
          <View style={styles.infoContainer}>
            <Text testID="current-title" style={[styles.title, { color: colors.text }]} numberOfLines={1}>{info.title}</Text>
            <Text testID="current-subtitle" style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>{info.subtitle}</Text>
          </View>
          <View style={styles.controls}>
            <TouchableOpacity testID="previous-button" style={styles.smallBtn} onPress={handlePrevious} disabled={isLoading || !canPrev}>
              <Ionicons name="play-skip-back" size={20} color={!canPrev ? colors.textSecondary : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity testID="play-pause-button" style={[styles.playBtn, { backgroundColor: hasError ? '#ff4444' : colors.primary }]} onPress={handlePlayPause} disabled={isLoading}>
              <Ionicons name={PlayIcon} size={24} color={colors.headerText} />
            </TouchableOpacity>
            <TouchableOpacity testID="next-button" style={styles.smallBtn} onPress={handleNext} disabled={isLoading || !canNext}>
              <Ionicons name="play-skip-forward" size={20} color={!canNext ? colors.textSecondary : colors.text} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View testID="progress-container" style={styles.progressContainer}>
          <View testID="progress-bar" style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View testID="progress-fill" style={[styles.progressFill, { backgroundColor: colors.primary, width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }]} />
          </View>
        </View>
      </Animated.View>

      {/* Expanded modal */}
      <Modal testID="expanded-player-modal" visible={isExpanded} transparent animationType="slide" onRequestClose={() => setIsExpanded(false)}>
        <View style={[styles.expandedContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.expandedHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity testID="close-expanded-button" style={styles.headerBtn} onPress={() => setIsExpanded(false)}>
              <Ionicons name="chevron-down" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.expandedTitle, { color: colors.text }]}>Sedang Diputar</Text>
            <TouchableOpacity testID="stop-audio-button" style={styles.headerBtn} onPress={stopAudio}>
              <Ionicons name="stop" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.expandedContent}>
            <View style={[styles.arabicBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text testID="arabic-text" style={[getArabicTextStyle(24), { color: colors.arabicText, textAlign: 'center', lineHeight: 40 }]}>
                {info.arabicText || 'لا توجد بيانات'}
              </Text>
            </View>

            <View style={styles.expandedInfo}>
              <Text testID="expanded-title" style={[styles.expandedSongTitle, { color: colors.text }]}>{info.title}</Text>
              <Text testID="expanded-subtitle" style={[styles.expandedArtist, { color: colors.textSecondary }]}>{info.subtitle}</Text>
              {hasError && <Text testID="error-text" style={styles.errorText}>Error memuat audio</Text>}
            </View>

            <View style={styles.progressExpanded}>
              <Slider
                testID="expanded-slider"
                style={styles.slider}
                minimumValue={0} maximumValue={duration || 1} value={currentTime}
                onValueChange={(v) => setCurrentTime(v)}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                disabled={!isPlaying || isLoading}
              />
              <View style={styles.timeRow}>
                <Text testID="current-time" style={[styles.timeText, { color: colors.textSecondary }]}>{formatTime(currentTime)}</Text>
                <Text testID="duration-time" style={[styles.timeText, { color: colors.textSecondary }]}>{formatTime(duration)}</Text>
              </View>
            </View>

            <View style={styles.expandedControls}>
              <TouchableOpacity testID="expanded-previous-button" style={styles.expandedCtrlBtn} onPress={handlePrevious} disabled={isLoading || !canPrev}>
                <Ionicons name="play-skip-back" size={32} color={!canPrev ? colors.textSecondary : colors.text} />
              </TouchableOpacity>
              <TouchableOpacity testID="expanded-play-pause-button" style={[styles.expandedPlayBtn, { backgroundColor: hasError ? '#ff4444' : colors.primary }]} onPress={handlePlayPause} disabled={isLoading}>
                <Ionicons name={PlayIcon} size={36} color={colors.headerText} />
              </TouchableOpacity>
              <TouchableOpacity testID="expanded-next-button" style={styles.expandedCtrlBtn} onPress={handleNext} disabled={isLoading || !canNext}>
                <Ionicons name="play-skip-forward" size={32} color={!canNext ? colors.textSecondary : colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container:       { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: StyleSheet.hairlineWidth, elevation: 8, shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, zIndex: 1000 },
  playerContent:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  infoContainer:   { flex: 1, marginRight: 12 },
  title:           { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  subtitle:        { fontSize: 12 },
  controls:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallBtn:        { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  playBtn:         { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  progressContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  progressBar:     { height: 2, borderRadius: 1, overflow: 'hidden' },
  progressFill:    { height: '100%', borderRadius: 1 },
  expandedContainer: { flex: 1 },
  expandedHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, paddingTop: 48, borderBottomWidth: StyleSheet.hairlineWidth },
  headerBtn:       { padding: 4 },
  expandedTitle:   { fontSize: 16, fontWeight: '600' },
  expandedContent: { flex: 1, paddingHorizontal: 24, paddingTop: 32, justifyContent: 'space-between' },
  arabicBox:       { padding: 24, borderRadius: 16, borderWidth: 1, marginBottom: 32, minHeight: 120, justifyContent: 'center' },
  expandedInfo:    { alignItems: 'center', marginBottom: 40 },
  expandedSongTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  expandedArtist:  { fontSize: 16, textAlign: 'center', marginBottom: 4 },
  errorText:       { fontSize: 12, textAlign: 'center', marginTop: 4, color: '#ff4444' },
  progressExpanded:{ marginBottom: 40 },
  slider:          { width: '100%', height: 40 },
  timeRow:         { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText:        { fontSize: 12, fontWeight: '500' },
  expandedControls:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 48 },
  expandedCtrlBtn: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
  expandedPlayBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
});
