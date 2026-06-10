// services/quranAPI.ts
import { cleanTranslationText } from '../utils/translationCleaner';

const BASE_URL         = 'https://api.quran.com/api/v4';
const TAJWEED_BASE_URL = 'https://api.quran.com/api/v4/quran/verses/uthmani_tajweed';
const EQURAN_BASE_URL  = 'https://equran.id/api/v2';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface TranslatedName {
  language_name: string;
  name: string;
}

export interface Chapter {
  id: number;
  chapter_number: number;
  name_arabic: string;
  name_simple: string;
  name_complex: string;
  verses_count: number;
  revelation_place: string;
  revelation_order: number;
  translated_name: TranslatedName;
  audioFull?: Record<string, string>;
}

export interface Verse {
  id: string | number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  text_uthmani_tajweed: string;
  text_latin?: string;
  translation?: string;
  audio?: Record<string, string>;
  hizb_number?: number;
  rub_number?: number;
  ruku_number?: number;
  manzil_number?: number;
  sajdah_number?: number | null;
  juz_number?: number;
  page_number?: number;
}

export interface Translation {
  id: string | number;
  verse_number: number;
  verse_key: string;
  text: string;
  raw_text?: string;
  resource_name: string;
  language_name: string;
}

export interface Reciter {
  id: string;
  name: string;
  folder_name: string;
}

export interface ChapterWithVerses {
  chapter: Chapter & { description?: string };
  verses: Verse[];
}

// ─── QuranAPI (quran.com v4) ──────────────────────────────────────────────────

export const QuranAPI = {

  async getChapters(): Promise<Chapter[]> {
    const response = await fetch(`${BASE_URL}/chapters?language=id`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.chapters as Chapter[];
  },

  async getVerses(chapterNumber: number, page = 1, perPage = 50): Promise<Verse[]> {
    const response = await fetch(
      `${TAJWEED_BASE_URL}?chapter_number=${chapterNumber}&page=${page}&per_page=${perPage}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    return data.verses.map((verse: Verse, index: number): Verse => ({
      id:                   verse.id ?? `${chapterNumber}-${index + 1}`,
      verse_number:         verse.verse_number ?? index + 1,
      verse_key:            verse.verse_key ?? `${chapterNumber}:${index + 1}`,
      text_uthmani:         verse.text_uthmani ?? '',
      text_uthmani_tajweed: verse.text_uthmani_tajweed ?? verse.text_uthmani ?? '',
      hizb_number:          verse.hizb_number,
      rub_number:           verse.rub_number,
      ruku_number:          verse.ruku_number,
      manzil_number:        verse.manzil_number,
      sajdah_number:        verse.sajdah_number,
      juz_number:           verse.juz_number,
      page_number:          verse.page_number,
    }));
  },

  async getVersesWithTajweed(chapterNumber: number, page = 1, perPage = 50): Promise<Verse[]> {
    try {
      return await this.getVerses(chapterNumber, page, perPage);
    } catch {
      return this.getVerses(chapterNumber, page, perPage);
    }
  },

  async getTranslations(chapterNumber: number, page = 1, perPage = 50): Promise<Translation[]> {
    const response = await fetch(
      `${BASE_URL}/quran/translations/33?chapter_number=${chapterNumber}&page=${page}&per_page=${perPage}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    return data.translations.map((t: Translation, index: number): Translation => ({
      id:            t.id ?? `trans-${chapterNumber}-${index + 1}`,
      verse_number:  t.verse_number ?? index + 1,
      verse_key:     t.verse_key ?? `${chapterNumber}:${index + 1}`,
      text:          cleanTranslationText(t.text),
      raw_text:      t.text,
      resource_name: t.resource_name ?? 'Indonesian Ministry of Religious Affairs',
      language_name: t.language_name ?? 'indonesian',
    }));
  },

  async getChapterInfo(chapterNumber: number): Promise<Chapter> {
    const response = await fetch(`${BASE_URL}/chapters/${chapterNumber}?language=id`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.chapter as Chapter;
  },

  getRecitations(): Reciter[] {
    return [
      { id: '01', name: 'Abdullah Al-Juhany',       folder_name: 'Abdullah-Al-Juhany' },
      { id: '02', name: 'Abdul Muhsin Al-Qasim',    folder_name: 'Abdul-Muhsin-Al-Qasim' },
      { id: '03', name: 'Abdurrahman as-Sudais',    folder_name: 'Abdurrahman-as-Sudais' },
      { id: '04', name: 'Ibrahim Al-Dossari',        folder_name: 'Ibrahim-Al-Dossari' },
      { id: '05', name: 'Misyari Rasyid Al-Afasi',  folder_name: 'Misyary-Rasyid-Al-Afasy' },
    ];
  },

  getAudioUrl(reciterId: string, chapterNumber: number, verseNumber: number): string {
    const reciters  = this.getRecitations();
    const reciter   = reciters.find(r => r.id === reciterId.toString());
    const folder    = reciter?.folder_name ?? 'Abdurrahman-as-Sudais';
    const surah     = chapterNumber.toString().padStart(3, '0');
    const ayat      = verseNumber.toString().padStart(3, '0');
    return `https://equran.nos.wjv-1.neo.id/audio-partial/${folder}/${surah}${ayat}.mp3`;
  },

  getFullSurahAudioUrl(reciterId: string, chapterNumber: number): string {
    const reciters  = this.getRecitations();
    const reciter   = reciters.find(r => r.id === reciterId.toString());
    const folder    = reciter?.folder_name ?? 'Abdurrahman-as-Sudais';
    const surah     = chapterNumber.toString().padStart(3, '0');
    return `https://equran.nos.wjv-1.neo.id/audio-full/${folder}/${surah}.mp3`;
  },
};

// ─── EquranAPI (equran.id v2) ─────────────────────────────────────────────────

export const EquranAPI = {

  async getChapters(): Promise<Chapter[]> {
    const response = await fetch(`${EQURAN_BASE_URL}/surat`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data.code !== 200) throw new Error('Invalid API response from equran.id');

    return data.data.map((surah: Record<string, unknown>): Chapter => ({
      id:               surah.nomor as number,
      chapter_number:   surah.nomor as number,
      name_arabic:      surah.nama as string,
      name_simple:      surah.namaLatin as string,
      name_complex:     surah.namaLatin as string,
      verses_count:     surah.jumlahAyat as number,
      revelation_place: surah.tempatTurun as string,
      revelation_order: surah.nomor as number,
      translated_name:  { language_name: 'indonesian', name: surah.arti as string },
      audioFull:        surah.audioFull as Record<string, string>,
    }));
  },

  async getChapterWithVerses(chapterNumber: number): Promise<ChapterWithVerses> {
    const response = await fetch(`${EQURAN_BASE_URL}/surat/${chapterNumber}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data.code !== 200) throw new Error('Invalid API response from equran.id');

    const s = data.data;
    return {
      chapter: {
        id:               s.nomor,
        chapter_number:   s.nomor,
        name_arabic:      s.nama,
        name_simple:      s.namaLatin,
        name_complex:     s.namaLatin,
        verses_count:     s.jumlahAyat,
        revelation_place: s.tempatTurun,
        revelation_order: s.nomor,
        translated_name:  { language_name: 'indonesian', name: s.arti },
        description:      s.deskripsi,
        audioFull:        s.audioFull,
      },
      verses: s.ayat.map((ayat: Record<string, unknown>): Verse => ({
        id:                   `${s.nomor}-${ayat.nomorAyat}`,
        verse_number:         ayat.nomorAyat as number,
        verse_key:            `${s.nomor}:${ayat.nomorAyat}`,
        text_uthmani:         ayat.teksArab as string,
        text_uthmani_tajweed: ayat.teksArab as string,
        text_latin:           ayat.teksLatin as string,
        translation:          cleanTranslationText(ayat.teksIndonesia as string),
        audio:                ayat.audio as Record<string, string>,
      })),
    };
  },
};
