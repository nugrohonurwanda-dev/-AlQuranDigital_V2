// types/navigation.ts
import { Chapter } from '../services/quranAPI';

// ─── Stack param lists ────────────────────────────────────────────────────────

export type SurahStackParamList = {
  SurahList:      undefined;
  SurahDetail:    { surah: Chapter; scrollToVerse?: number };
  TajweedLessons: undefined;
  TajweedDetail:  { lessonId?: string; title?: string };
};

export type SettingsStackParamList = {
  Settings:       undefined;
  TajweedLessons: undefined;
  TajweedDetail:  { lessonId?: string; title?: string };
};

// Kept for TajweedDetailScreen backward compat (Tajweed is now in Surah & Settings stacks)
export type TajweedStackParamList = {
  TajweedLessons: undefined;
  TajweedDetail:  { lessonId?: string; title?: string };
};

export type JuzStackParamList = {
  JuzList:   undefined;
  JuzDetail: {
    juzNumber:  number;
    arabicName: string;
    startSurah: string;
    endSurah:   string;
  };
};

export type SavedStackParamList = {
  Saved: undefined;
};

// ─── Tab param list ───────────────────────────────────────────────────────────

export type TabParamList = {
  QuranTab:    undefined;
  JuzTab:      undefined;
  SavedTab:    undefined;
  SettingsTab: undefined;
};
