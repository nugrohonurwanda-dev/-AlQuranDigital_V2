// components/VerseAudio.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../contexts/AudioContext';

type Size = 'small' | 'medium' | 'large';

interface Props {
  chapterNumber:    number;
  verseNumber:      number;
  style?:           object;
  onPlaybackStart?: () => void;
  onPlaybackEnd?:   () => void;
  onPlaybackError?: (error: Error) => void;
  size?:            Size;
}

const SIZE_MAP: Record<Size, { buttonSize: number; iconSize: number; padding: number }> = {
  small:  { buttonSize: 32, iconSize: 16, padding: 6  },
  medium: { buttonSize: 40, iconSize: 20, padding: 8  },
  large:  { buttonSize: 48, iconSize: 24, padding: 10 },
};

export default function VerseAudio({
  chapterNumber, verseNumber, style,
  onPlaybackStart, onPlaybackEnd, onPlaybackError,
  size = 'medium',
}: Props) {
  const {
    playVerseAudio, stopAudio, getCurrentReciterName,
    isVerseAudioPlaying, isVerseAudioLoading, hasError,
    selectedReciter, isInitialized,
  } = useAudio();

  const [localError, setLocalError] = useState(false);
  const verseKey              = `${chapterNumber}:${verseNumber}`;
  const lastPlayingRef        = useRef(false);
  const lastLoadingRef        = useRef(false);
  const callbacksSent         = useRef({ start: false, end: false, error: false });

  const isCurrentlyPlaying = isVerseAudioPlaying(chapterNumber, verseNumber);
  const isCurrentlyLoading = isVerseAudioLoading(chapterNumber, verseNumber);
  const hasCurrentError    = hasError && (isCurrentlyPlaying || isCurrentlyLoading);

  useEffect(() => {
    setLocalError(false);
    callbacksSent.current = { start: false, end: false, error: false };
  }, [selectedReciter, chapterNumber, verseNumber]);

  useEffect(() => {
    const wasPlaying = lastPlayingRef.current;
    const wasLoading = lastLoadingRef.current;
    lastPlayingRef.current = isCurrentlyPlaying;
    lastLoadingRef.current = isCurrentlyLoading;

    if (!wasPlaying && isCurrentlyPlaying && !callbacksSent.current.start) {
      setLocalError(false);
      callbacksSent.current = { ...callbacksSent.current, start: true, end: false };
      onPlaybackStart?.();
    }

    if (wasPlaying && !isCurrentlyPlaying && !isCurrentlyLoading && !callbacksSent.current.end) {
      callbacksSent.current = { ...callbacksSent.current, end: true, start: false };
      onPlaybackEnd?.();
    }

    if ((wasLoading || wasPlaying) && hasCurrentError && !callbacksSent.current.error) {
      callbacksSent.current = { ...callbacksSent.current, error: true };
      handleError(new Error('Audio playback failed'));
    }

    if (!hasCurrentError && callbacksSent.current.error) {
      callbacksSent.current = { ...callbacksSent.current, error: false };
    }
  }, [isCurrentlyPlaying, isCurrentlyLoading, hasCurrentError]);

  const handleError = useCallback((error: Error) => {
    setLocalError(true);
    Alert.alert(
      'Audio Error',
      `Gagal memutar audio ${verseKey}\nQari: ${getCurrentReciterName()}`,
      [
        { text: 'Coba Lagi', onPress: () => { setLocalError(false); callbacksSent.current = { start: false, end: false, error: false }; setTimeout(handleTogglePlayback, 1000); } },
        { text: 'Batal', style: 'cancel' },
      ],
    );
    onPlaybackError?.(error);
  }, [verseKey, getCurrentReciterName, onPlaybackError]);

  const handleTogglePlayback = useCallback(async () => {
    if (isCurrentlyLoading || !isInitialized || !chapterNumber || !verseNumber) return;
    try {
      if (isCurrentlyPlaying) {
        await stopAudio();
      } else {
        callbacksSent.current = { start: false, end: false, error: false };
        await playVerseAudio(chapterNumber, verseNumber);
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [chapterNumber, verseNumber, isCurrentlyPlaying, isCurrentlyLoading, stopAudio, playVerseAudio, handleError, isInitialized]);

  const { buttonSize, iconSize, padding } = SIZE_MAP[size];

  const iconName: React.ComponentProps<typeof Ionicons>['name'] =
    localError || hasCurrentError ? 'warning' :
    isCurrentlyLoading             ? 'hourglass' :
    isCurrentlyPlaying             ? 'stop' : 'play';

  const iconColor =
    localError || hasCurrentError ? '#f44336' :
    isCurrentlyLoading             ? '#ff9800' :
    isCurrentlyPlaying             ? '#ffffff' : '#2E7D32';

  const buttonExtraStyle =
    localError || hasCurrentError ? styles.btnError :
    isCurrentlyLoading             ? styles.btnLoading :
    isCurrentlyPlaying             ? styles.btnPlaying : undefined;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.btn, buttonExtraStyle, { minWidth: buttonSize, minHeight: buttonSize, padding }]}
        onPress={handleTogglePlayback}
        disabled={isCurrentlyLoading || !isInitialized}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          isCurrentlyPlaying ? `Stop ayat ${chapterNumber}:${verseNumber}` :
          `Putar ayat ${chapterNumber}:${verseNumber}`
        }
      >
        <Ionicons name={iconName} size={iconSize} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { alignItems: 'center' },
  btn:        { borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22 },
  btnPlaying: { backgroundColor: '#2E7D32', borderWidth: 1, borderColor: '#1B5E20' },
  btnLoading: { backgroundColor: '#fff3e0', borderWidth: 1, borderColor: '#ff9800' },
  btnError:   { backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#f44336' },
});
