// types/navigation.ts
import { Chapter } from '../services/quranAPI';

// ─── Stack param lists ────────────────────────────────────────────────────────

export type SurahStackParamList = {
  SurahList:   undefined;
  SurahDetail: { surah: Chapter };
};

export type TajweedStackParamList = {
  TajweedLessons: undefined;
  TajweedDetail:  { lessonId?: string; title?: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
};

// ─── Tab param list ───────────────────────────────────────────────────────────

export type TabParamList = {
  QuranTab:    undefined;
  TajweedTab:  undefined;
  SettingsTab: undefined;
};
