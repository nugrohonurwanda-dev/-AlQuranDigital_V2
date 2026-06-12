// contexts/BookmarkContext.tsx
import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookmarkItem {
  verse_key:              string;   // "18:10" — primary key
  surah_id:               number;
  surah_name:             string;
  surah_name_arabic:      string;
  surah_translated_name:  string;
  surah_verses_count:     number;
  surah_revelation_place: string;
  verse_number:           number;
  arabic_text:            string;
  translation_text:       string;
  saved_at:               number;   // Date.now()
}

interface BookmarkContextValue {
  bookmarks:        BookmarkItem[];
  isBookmarked:     (verseKey: string) => boolean;
  addBookmark:      (item: BookmarkItem) => Promise<void>;
  removeBookmark:   (verseKey: string) => Promise<void>;
  clearAll:         () => Promise<void>;
  isLoading:        boolean;
  /** Bookmarks grouped by surah_id, sorted by verse_number */
  bookmarksBySurah: Map<number, BookmarkItem[]>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY     = '@quran_bookmarks_v1';
const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─ Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setBookmarks(JSON.parse(raw) as BookmarkItem[]);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // ─ Persist helper ─────────────────────────────────────────────────────────
  const persist = useCallback(async (items: BookmarkItem[]) => {
    setBookmarks(items);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  // ─ API ────────────────────────────────────────────────────────────────────
  const isBookmarked = useCallback(
    (verseKey: string) => bookmarks.some(b => b.verse_key === verseKey),
    [bookmarks],
  );

  const addBookmark = useCallback(async (item: BookmarkItem) => {
    if (bookmarks.some(b => b.verse_key === item.verse_key)) return;
    await persist([item, ...bookmarks]);
  }, [bookmarks, persist]);

  const removeBookmark = useCallback(async (verseKey: string) => {
    await persist(bookmarks.filter(b => b.verse_key !== verseKey));
  }, [bookmarks, persist]);

  const clearAll = useCallback(async () => {
    await persist([]);
  }, [persist]);

  // ─ Grouped by surah ───────────────────────────────────────────────────────
  const bookmarksBySurah = React.useMemo(() => {
    const map = new Map<number, BookmarkItem[]>();
    for (const b of bookmarks) {
      const arr = map.get(b.surah_id) ?? [];
      arr.push(b);
      map.set(b.surah_id, arr);
    }
    // Sort each group by verse_number
    for (const [key, arr] of map) {
      map.set(key, arr.sort((a, b) => a.verse_number - b.verse_number));
    }
    return map;
  }, [bookmarks]);

  return (
    <BookmarkContext.Provider value={{
      bookmarks, isBookmarked, addBookmark, removeBookmark,
      clearAll, isLoading, bookmarksBySurah,
    }}>
      {children}
    </BookmarkContext.Provider>
  );
}

// Safe default — tidak crash meski Provider belum di-mount
const DEFAULT_VALUE: BookmarkContextValue = {
  bookmarks:        [],
  isBookmarked:     () => false,
  addBookmark:      async () => {},
  removeBookmark:   async () => {},
  clearAll:         async () => {},
  isLoading:        false,
  bookmarksBySurah: new Map(),
};

export function useBookmarks(): BookmarkContextValue {
  return useContext(BookmarkContext) ?? DEFAULT_VALUE;
}
