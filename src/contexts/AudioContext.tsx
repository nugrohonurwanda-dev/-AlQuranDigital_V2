// contexts/AudioContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { QuranAPI } from '../services/quranAPI';

export interface CurrentVerse {
  chapterNumber: number;
  verseNumber:   number;
}

export interface AudioContextType {
  selectedReciter:       string;
  audioQuality:          string;
  isInitialized:         boolean;
  availableReciters:     Record<string, string>;
  isPlaying:             boolean;
  isLoading:             boolean;
  currentVerse:          CurrentVerse | null;
  hasError:              boolean;
  getAudioUrl:           (chapter: number, verse: number) => string;
  getFullSurahAudioUrl:  (chapter: number) => string;
  getCurrentReciterName: () => string;
  getAllReciters:         () => Record<string, string>;
  updateReciter:         (id: string) => boolean;
  updateAudioQuality:    (quality: string) => boolean;
  playVerseAudio: (
    chapter:  number,
    verse:    number,
    onStart?: () => void,
    onEnd?:   () => void,
    onError?: (e: Error) => void,
  ) => Promise<void>;
  stopAudio:           () => Promise<void>;
  pauseAudio:          () => Promise<void>;
  resumeAudio:         () => Promise<void>;
  isVerseAudioPlaying: (chapter: number, verse: number) => boolean;
  isVerseAudioLoading: (chapter: number, verse: number) => boolean;
  setSelectedReciter:  (id: string) => boolean;
  setAudioQuality:     (q: string) => boolean;
}

const EQURAN_RECITERS: Record<string, string> = {
  '01': 'Abdullah Al-Juhany',
  '02': 'Abdul Muhsin Al-Qasim',
  '03': 'Abdurrahman as-Sudais',
  '04': 'Ibrahim Al-Dossari',
  '05': 'Misyari Rasyid Al-Afasi',
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = (): AudioContextType => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedReciter,   setSelectedReciter]   = useState('05');
  const [audioQuality,      setAudioQuality]      = useState('standard');
  const [isInitialized,     setIsInitialized]     = useState(false);
  const [availableReciters, setAvailableReciters] = useState<Record<string, string>>(EQURAN_RECITERS);
  const [currentVerse,      setCurrentVerse]      = useState<CurrentVerse | null>(null);
  const [hasError,          setHasError]          = useState(false);

  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const isPlaying = status.playing    ?? false;
  const isLoading = status.isBuffering ?? false;

  // ─── Refs ─────────────────────────────────────────────────────────────────────
  const onEndRef             = useRef<(() => void) | undefined>(undefined);
  const onErrorRef           = useRef<((e: Error) => void) | undefined>(undefined);
  const didFinishHandled     = useRef(false);
  const pendingPlay          = useRef(false);   // ← tunggu loaded baru play
  const pendingPlayTimeout   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Auto-play saat audio sudah siap di-buffer ───────────────────────────────
  // Ini fix utama: replace() butuh waktu load dari network
  // baru setelah isLoaded === true, play() dipanggil
  useEffect(() => {
    if (pendingPlay.current && status.isLoaded && !status.isBuffering) {
      pendingPlay.current = false;
      if (pendingPlayTimeout.current) clearTimeout(pendingPlayTimeout.current);
      player.volume = 1.0;
      player.muted  = false;
      player.play();
    }
  }, [status.isLoaded, status.isBuffering]);

  // ─── Deteksi audio selesai ───────────────────────────────────────────────────
  useEffect(() => {
    if (status.didJustFinish && !didFinishHandled.current) {
      didFinishHandled.current = true;
      setCurrentVerse(null);
      setTimeout(() => {
        onEndRef.current?.();
        didFinishHandled.current = false;
      }, 150);
    }
  }, [status.didJustFinish]);

  // ─── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadPreferences();
    loadReciters();
    initAudioMode();
  }, []);

  useEffect(() => {
    if (isInitialized) savePreferences();
  }, [selectedReciter, audioQuality, isInitialized]);

  const initAudioMode = async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode:      true,
        allowsRecording:        false,
        shouldPlayInBackground: true,
      });
    } catch { /* noop */ }
  };

  // ─── Persistence ─────────────────────────────────────────────────────────────
  const loadPreferences = async () => {
    try {
      const [r, q] = await Promise.all([
        AsyncStorage.getItem('equranReciterId'),
        AsyncStorage.getItem('audioQuality'),
      ]);
      if (r && EQURAN_RECITERS[r])                     setSelectedReciter(r);
      if (q && ['standard', 'high'].includes(q)) setAudioQuality(q);
    } finally {
      setIsInitialized(true);
    }
  };

  const savePreferences = async () => {
    await Promise.all([
      AsyncStorage.setItem('equranReciterId', selectedReciter),
      AsyncStorage.setItem('audioQuality',    audioQuality),
    ]);
  };

  const loadReciters = async () => {
    try {
      const map: Record<string, string> = {};
      QuranAPI.getRecitations().forEach(r => { map[r.id] = r.name; });
      setAvailableReciters(map);
    } catch { /* gunakan default */ }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const getAudioUrl = useCallback(
    (ch: number, v: number) => QuranAPI.getAudioUrl(selectedReciter, ch, v),
    [selectedReciter],
  );

  const getFullSurahAudioUrl = useCallback(
    (ch: number) => QuranAPI.getFullSurahAudioUrl(selectedReciter, ch),
    [selectedReciter],
  );

  const getCurrentReciterName = useCallback(
    () => availableReciters[selectedReciter] ?? 'Unknown',
    [availableReciters, selectedReciter],
  );

  const getAllReciters    = useCallback(() => availableReciters, [availableReciters]);
  const updateReciter    = useCallback((id: string) => { if (!availableReciters[id]) return false; setSelectedReciter(id); return true; }, [availableReciters]);
  const updateAudioQuality = useCallback((q: string) => { if (!['standard', 'high'].includes(q)) return false; setAudioQuality(q); return true; }, []);

  // ─── Playback ────────────────────────────────────────────────────────────────
  const stopAudio = useCallback(async () => {
    pendingPlay.current = false;
    if (pendingPlayTimeout.current) clearTimeout(pendingPlayTimeout.current);
    didFinishHandled.current = true;
    try { player.pause(); player.seekTo(0); } catch { /* noop */ }
    setCurrentVerse(null);
  }, [player]);

  const playVerseAudio = useCallback(async (
    chapterNumber:    number,
    verseNumber:      number,
    onPlaybackStart?: () => void,
    onPlaybackEnd?:   () => void,
    onPlaybackError?: (e: Error) => void,
  ) => {
    try {
      setHasError(false);
      didFinishHandled.current = false;
      onEndRef.current   = onPlaybackEnd;
      onErrorRef.current = onPlaybackError;

      // Toggle tap ayat yang sama → stop
      if (isPlaying &&
        currentVerse?.chapterNumber === chapterNumber &&
        currentVerse?.verseNumber   === verseNumber) {
        await stopAudio();
        return;
      }

      // Hentikan yang sedang main
      if (isPlaying) player.pause();

      // Reset pending
      pendingPlay.current = false;
      if (pendingPlayTimeout.current) clearTimeout(pendingPlayTimeout.current);

      const url = getAudioUrl(chapterNumber, verseNumber);
      setCurrentVerse({ chapterNumber, verseNumber });

      // Load audio — play akan dipanggil otomatis via useEffect saat isLoaded
      player.replace({ uri: url });
      pendingPlay.current = true;

      // Fallback: kalau 8 detik belum loaded, coba play paksa
      pendingPlayTimeout.current = setTimeout(() => {
        if (pendingPlay.current) {
          pendingPlay.current = false;
          player.volume = 1.0;
          player.muted  = false;
          player.play();
        }
      }, 8000);

      onPlaybackStart?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setHasError(true);
      setCurrentVerse(null);
      onPlaybackError?.(err);
    }
  }, [isPlaying, currentVerse, player, getAudioUrl, stopAudio]);

  const pauseAudio  = useCallback(async () => { if (isPlaying)  player.pause(); }, [isPlaying, player]);
  const resumeAudio = useCallback(async () => { if (!isPlaying) player.play();  }, [isPlaying, player]);

  const isVerseAudioPlaying = useCallback((ch: number, v: number) =>
    isPlaying && currentVerse?.chapterNumber === ch && currentVerse?.verseNumber === v,
    [isPlaying, currentVerse]);

  const isVerseAudioLoading = useCallback((ch: number, v: number) =>
    isLoading && currentVerse?.chapterNumber === ch && currentVerse?.verseNumber === v,
    [isLoading, currentVerse]);

  return (
    <AudioContext.Provider value={{
      selectedReciter, audioQuality, isInitialized, availableReciters,
      isPlaying, isLoading, currentVerse, hasError,
      getAudioUrl, getFullSurahAudioUrl,
      getCurrentReciterName, getAllReciters,
      updateReciter, updateAudioQuality,
      playVerseAudio, stopAudio, pauseAudio, resumeAudio,
      isVerseAudioPlaying, isVerseAudioLoading,
      setSelectedReciter: updateReciter,
      setAudioQuality:    updateAudioQuality,
    }}>
      {children}
    </AudioContext.Provider>
  );
};