// contexts/ReadingProgressContext.tsx
import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SurahProgress {
  surah_id:              number;
  last_verse_number:     number;   // posisi terakhir (untuk "lanjut baca")
  highest_verse_number:  number;   // ayat tertinggi yang pernah dilihat (untuk %)
  total_verses:          number;
  last_read_at:          number;   // timestamp
}

interface ReadingProgressContextValue {
  allProgress:      Record<number, SurahProgress>;
  getProgress:      (surahId: number) => SurahProgress | null;
  updateProgress:   (surahId: number, verseNumber: number, totalVerses: number) => Promise<void>;
  progressPercent:  (surahId: number) => number;
  isCompleted:      (surahId: number) => boolean;
  resetProgress:    (surahId: number) => Promise<void>;
  isLoading:        boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY             = '@quran_reading_progress_v1';
const COMPLETE_THRESHOLD      = 0.95;   // 95% = dianggap selesai
const ReadingProgressContext  = createContext<ReadingProgressContextValue | null>(null);

export function ReadingProgressProvider({ children }: { children: React.ReactNode }) {
  const [allProgress, setAllProgress] = useState<Record<number, SurahProgress>>({});
  const [isLoading,   setIsLoading]   = useState(true);

  // ─ Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setAllProgress(JSON.parse(raw) as Record<number, SurahProgress>);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback(async (data: Record<number, SurahProgress>) => {
    setAllProgress(data);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // ─ API ───────────────────────────────────────────────────────────────────

  const getProgress = useCallback(
    (surahId: number) => allProgress[surahId] ?? null,
    [allProgress],
  );

  const updateProgress = useCallback(async (
    surahId: number,
    verseNumber: number,
    totalVerses: number,
  ) => {
    const existing = allProgress[surahId];
    const updated: SurahProgress = {
      surah_id:             surahId,
      last_verse_number:    verseNumber,
      highest_verse_number: Math.max(verseNumber, existing?.highest_verse_number ?? 0),
      total_verses:         totalVerses,
      last_read_at:         Date.now(),
    };
    await persist({ ...allProgress, [surahId]: updated });
  }, [allProgress, persist]);

  const progressPercent = useCallback((surahId: number): number => {
    const p = allProgress[surahId];
    if (!p || p.total_verses === 0) return 0;
    return Math.min(100, Math.round((p.highest_verse_number / p.total_verses) * 100));
  }, [allProgress]);

  const isCompleted = useCallback((surahId: number): boolean => {
    const p = allProgress[surahId];
    if (!p || p.total_verses === 0) return false;
    return p.highest_verse_number / p.total_verses >= COMPLETE_THRESHOLD;
  }, [allProgress]);

  const resetProgress = useCallback(async (surahId: number) => {
    const next = { ...allProgress };
    delete next[surahId];
    await persist(next);
  }, [allProgress, persist]);

  return (
    <ReadingProgressContext.Provider value={{
      allProgress, getProgress, updateProgress,
      progressPercent, isCompleted, resetProgress, isLoading,
    }}>
      {children}
    </ReadingProgressContext.Provider>
  );
}

// Safe default — komponen tidak crash meski Provider belum di-mount
const DEFAULT_VALUE: ReadingProgressContextValue = {
  allProgress:    {},
  getProgress:    () => null,
  updateProgress: async () => {},
  progressPercent: () => 0,
  isCompleted:    () => false,
  resetProgress:  async () => {},
  isLoading:      false,
};

export function useReadingProgress(): ReadingProgressContextValue {
  return useContext(ReadingProgressContext) ?? DEFAULT_VALUE;
}
