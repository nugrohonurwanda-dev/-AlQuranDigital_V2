// screens/JuzDetailScreen.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  Alert, StatusBar, ListRenderItemInfo, TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { QuranAPI, Verse, Translation, Chapter } from '../services/quranAPI';
import VerseItem from '../components/VerseItem';
import ScrollToTopFAB from '../components/ScrollToTopFAB';
import { useTheme } from '../contexts/ThemeContext';
import { useFonts } from '../contexts/FontContext';
import { JuzStackParamList } from '../types/navigation';
import { useBookmarks }       from '../contexts/BookmarkContext';
import { useReadingProgress } from '../contexts/ReadingProgressContext';
import {
  VerseItemSkeleton, BismillahSkeleton,
} from '../components/SkeletonLoader';

type Props = {
  navigation: StackNavigationProp<JuzStackParamList, 'JuzDetail'>;
  route:      RouteProp<JuzStackParamList, 'JuzDetail'>;
};

// ─── List item types ──────────────────────────────────────────────────────────

type SurahSeparatorItem = {
  type:          'surah_separator';
  chapterNumber: number;
  chapter?:      Chapter;
};

type VerseListItem = {
  type:        'verse';
  verse:       Verse;
  translation?: Translation;
};

type ListItem = SurahSeparatorItem | VerseListItem;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildListItems(
  verses:     Verse[],
  transMap:   Record<string, Translation>,
  chapterMap: Record<number, Chapter>,
): ListItem[] {
  const items: ListItem[] = [];
  let lastChapter = -1;

  for (const verse of verses) {
    const chapterNumber = parseInt(verse.verse_key.split(':')[0], 10);
    if (chapterNumber !== lastChapter) {
      items.push({ type: 'surah_separator', chapterNumber, chapter: chapterMap[chapterNumber] });
      lastChapter = chapterNumber;
    }
    items.push({ type: 'verse', verse, translation: transMap[verse.verse_key] });
  }
  return items;
}

const PER_PAGE = 50;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function JuzDetailScreen({ navigation, route }: Props) {
  const { juzNumber, arabicName, startSurah, endSurah } = route.params;
  const { colors, isDarkMode, gradients } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { updateProgress }                            = useReadingProgress();
  const { getArabicTextStyle } = useFonts();

  const [verses,          setVerses]          = useState<Verse[]>([]);
  const [translations,    setTranslations]    = useState<Translation[]>([]);
  const [chapterMap,      setChapterMap]      = useState<Record<number, Chapter>>({});
  const [loading,         setLoading]         = useState(true);
  const [loadingMore,     setLoadingMore]     = useState(false);
  const [hasMore,         setHasMore]         = useState(true);
  const [page,            setPage]            = useState(1);
  const [totalCount,      setTotalCount]      = useState(0);
  const [fontSize,        setFontSize]        = useState(28);
  const [showFAB,         setShowFAB]         = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  const transMap = useMemo<Record<string, Translation>>(() => {
    const map: Record<string, Translation> = {};
    for (const t of translations) {
      if (t.verse_key) map[t.verse_key] = t;
    }
    return map;
  }, [translations]);

  const listItems = useMemo<ListItem[]>(
    () => buildListItems(verses, transMap, chapterMap),
    [verses, transMap, chapterMap],
  );

  const fetchMissingChapters = useCallback(async (newVerses: Verse[]) => {
    const needed = new Set<number>();
    for (const v of newVerses) {
      const cn = parseInt(v.verse_key.split(':')[0], 10);
      if (!isNaN(cn) && !chapterMap[cn]) needed.add(cn);
    }
    if (needed.size === 0) return;

    const results = await Promise.allSettled(
      Array.from(needed).map(cn => QuranAPI.getChapterInfo(cn)),
    );

    const additions: Record<number, Chapter> = {};
    results.forEach(result => {
      if (result.status === 'fulfilled') additions[result.value.id] = result.value;
    });

    if (Object.keys(additions).length > 0) {
      setChapterMap(prev => ({ ...prev, ...additions }));
    }
  }, [chapterMap]);

  const handleToggleBookmark = useCallback((verse: Verse) => {
    const chapterNumber = parseInt(verse.verse_key.split(':')[0], 10);
    const chapter = chapterMap[chapterNumber];
    const vk = verse.verse_key;
    if (isBookmarked(vk)) {
      removeBookmark(vk);
    } else {
      addBookmark({
        verse_key:              vk,
        surah_id:               chapterNumber,
        surah_name:             chapter?.name_simple ?? `Surah ${chapterNumber}`,
        surah_name_arabic:      chapter?.name_arabic ?? '',
        surah_translated_name:  chapter?.translated_name?.name ?? '',
        surah_verses_count:     chapter?.verses_count ?? 0,
        surah_revelation_place: chapter?.revelation_place ?? '',
        verse_number:           verse.verse_number,
        arabic_text:            verse.text_uthmani ?? '',
        translation_text:       '',
        saved_at:               Date.now(),
      });
    }
  }, [chapterMap, isBookmarked, addBookmark, removeBookmark]);

  const loadPage = useCallback(async (targetPage: number, isLoadMore = false) => {
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true);

      const [versesResult, newTranslations] = await Promise.all([
        QuranAPI.getVersesByJuz(juzNumber, targetPage, PER_PAGE),
        QuranAPI.getTranslationsByJuz(juzNumber, targetPage, PER_PAGE),
      ]);

      const { verses: newVerses, hasNextPage, totalCount: total } = versesResult;
      await fetchMissingChapters(newVerses);

      if (isLoadMore) {
        setVerses(prev       => [...prev, ...newVerses]);
        setTranslations(prev => [...prev, ...newTranslations]);
      } else {
        setVerses(newVerses);
        setTranslations(newTranslations);
        setTotalCount(total);
      }

      setHasMore(hasNextPage);
      setPage(targetPage);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal memuat Juz';
      Alert.alert('Error', msg, [{ text: 'OK' }], {
        cancelable: true,
        userInterfaceStyle: isDarkMode ? 'dark' : 'light',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [juzNumber, fetchMissingChapters, isDarkMode]);

  useEffect(() => {
    loadPage(1);
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading && !loadingMore) loadPage(page + 1, true);
  }, [hasMore, loading, loadingMore, page, loadPage]);

  const onScroll = useCallback(({ nativeEvent }: any) => {
    setShowFAB(nativeEvent.contentOffset.y > 300);
  }, []);

  // ─ Header ────────────────────────────────────────────────────────────────
  const JuzHeader = () => (
    <View>
      <LinearGradient
        colors={isDarkMode ? ['#2D3748', '#4A5568'] : ['#667eea', '#7c3aed']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.juzBadge}>
          <Text style={styles.juzBadgeNum}>{juzNumber}</Text>
          <Text style={styles.juzBadgeLabel}>JUZ</Text>
        </View>

        <Text style={[getArabicTextStyle(28), styles.juzArabicName]}>{arabicName}</Text>
        <Text style={styles.juzRange}>{startSurah} — {endSurah}</Text>

        {totalCount > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons name="list" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{totalCount} Ayat</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="book-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{Object.keys(chapterMap).length} Surah</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      <View style={[styles.controlsBar, {
        backgroundColor: colors.cardBackground, borderBottomColor: colors.border,
      }]}>
        <View style={styles.fontGroup}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.background }]}
            onPress={() => setFontSize(s => Math.max(18, s - 2))}
            disabled={fontSize <= 18}
          >
            <Ionicons name="remove" size={16} color={fontSize <= 18 ? colors.textLight : colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.fontLabel, { color: colors.textSecondary }]}>{fontSize}px</Text>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.background }]}
            onPress={() => setFontSize(s => Math.min(40, s + 2))}
            disabled={fontSize >= 40}
          >
            <Ionicons name="add" size={16} color={fontSize >= 40 ? colors.textLight : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.ctrlBtn} onPress={() => setShowTranslation(v => !v)} activeOpacity={0.75}>
          <Ionicons
            name={showTranslation ? 'text' : 'text-outline'} size={15}
            color={showTranslation ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.ctrlLabel, { color: showTranslation ? colors.primary : colors.textSecondary }]}>
            Terjemahan
          </Text>
        </TouchableOpacity>

        {totalCount > 0 && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.pageIndicator, { color: colors.textLight }]}>
              {verses.length}/{totalCount}
            </Text>
          </>
        )}
      </View>
    </View>
  );

  // ─ Surah separator ────────────────────────────────────────────────────────
  const SurahSeparator = ({ item }: { item: SurahSeparatorItem }) => {
    const chapter = item.chapter;
    return (
      <View style={[styles.surahSeparator, {
        backgroundColor: isDarkMode ? colors.cardBackground + 'cc' : colors.primary + '08',
        borderColor:     colors.primary + '30',
      }]}>
        <View style={[styles.surahSepBar, { backgroundColor: colors.primary }]} />
        <View style={styles.surahSepInfo}>
          {chapter ? (
            <>
              <Text style={[styles.surahSepName, { color: colors.primary }]}>{chapter.name_simple}</Text>
              <Text style={[styles.surahSepMeta, { color: colors.textSecondary }]}>
                {chapter.translated_name.name} · {chapter.verses_count} ayat · {chapter.revelation_place}
              </Text>
            </>
          ) : (
            <Text style={[styles.surahSepName, { color: colors.primary }]}>Surah {item.chapterNumber}</Text>
          )}
        </View>
        {chapter && (
          <Text style={[styles.surahSepArabic, { color: colors.primary, fontFamily: 'Amiri-Bold' }]}>
            {chapter.name_arabic}
          </Text>
        )}
      </View>
    );
  };

  // ─ Footer ────────────────────────────────────────────────────────────────
  const Footer = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.footerLoadingText, { color: colors.textSecondary }]}>Memuat ayat selanjutnya…</Text>
        </View>
      );
    }
    if (hasMore) {
      return (
        <TouchableOpacity
          style={[styles.loadMoreBtn, { backgroundColor: colors.primary }]}
          onPress={loadMore} activeOpacity={0.85}
        >
          <Text style={styles.loadMoreText}>Muat Ayat Selanjutnya</Text>
          <Ionicons name="chevron-down" size={16} color="#fff" />
        </TouchableOpacity>
      );
    }
    return (
      <View style={[styles.endCard, {
        backgroundColor: isDarkMode ? colors.cardBackground : colors.primary + '08',
        borderColor:     colors.primary + '30',
      }]}>
        <Text style={[styles.endArabic, { color: colors.primary, fontFamily: 'Amiri-Bold' }]}>
          صَدَقَ اللَّهُ الْعَظِيمُ
        </Text>
        <Text style={[styles.endText, { color: colors.textSecondary }]}>Akhir Juz {juzNumber}</Text>
      </View>
    );
  };

  // ─ Render item ───────────────────────────────────────────────────────────
  const renderItem = ({ item }: ListRenderItemInfo<ListItem>) => {
    if (item.type === 'surah_separator') return <SurahSeparator item={item} />;

    const { verse, translation } = item;
    const chapterNumber = parseInt(verse.verse_key.split(':')[0], 10);

    return (
      <VerseItem
        verse={verse}
        translation={translation}
        fontSize={fontSize}
        showTranslation={showTranslation}
        chapterNumber={chapterNumber}
        isBookmarked={isBookmarked(verse.verse_key)}
        onToggleBookmark={handleToggleBookmark}
        showAudio
        theme={{ colors, isDarkMode, gradients }}
        onAudioPlaybackStart={() => {}}
        onAudioPlaybackEnd={() => {}}
        onAudioPlaybackError={() => Alert.alert('Audio Error', 'Tidak dapat memutar audio. Coba lagi nanti.')}
      />
    );
  };

  // ─ Loading skeleton ───────────────────────────────────────────────────────
  if (loading && verses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={isDarkMode ? ['#2D3748', '#4A5568'] : ['#667eea', '#7c3aed']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.juzBadge}>
            <Text style={styles.juzBadgeNum}>{juzNumber}</Text>
            <Text style={styles.juzBadgeLabel}>JUZ</Text>
          </View>
          <Text style={[getArabicTextStyle(28), styles.juzArabicName]}>{arabicName}</Text>
          <Text style={styles.juzRange}>{startSurah} — {endSurah}</Text>
        </LinearGradient>
        <BismillahSkeleton />
        {Array.from({ length: 7 }).map((_, i) => (
          <VerseItemSkeleton key={i} odd={i % 2 !== 0} />
        ))}
      </View>
    );
  }

  // ─ Main render ───────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={listItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => {
          if (item.type === 'surah_separator') return `sep-${item.chapterNumber}`;
          return item.verse.verse_key ?? `verse-${index}`;
        }}
        ListHeaderComponent={<JuzHeader />}
        ListFooterComponent={<Footer />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={12}
        windowSize={21}
        initialNumToRender={15}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        onScroll={onScroll}
        scrollEventThrottle={150}
        keyboardShouldPersistTaps="handled"
      />
      <ScrollToTopFAB
        visible={showFAB}
        onPress={() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          setShowFAB(false);
        }}
        bottomExtra={60}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1 },
  listContent: { paddingBottom: 40 },
  gradientHeader: {
    paddingTop: 48, paddingBottom: 24, paddingHorizontal: 20,
    alignItems: 'center', position: 'relative',
  },
  backBtn: {
    position: 'absolute', top: 48, left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  juzBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  juzBadgeNum:   { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 24 },
  juzBadgeLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  juzArabicName: { color: '#fff', textAlign: 'center', marginBottom: 4 },
  juzRange:      { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 12, textAlign: 'center' },
  statsRow:      { flexDirection: 'row', gap: 10 },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  statText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  controlsBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, gap: 4,
  },
  fontGroup:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn:     { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  fontLabel:   { fontSize: 12, fontWeight: '600', minWidth: 30, textAlign: 'center' },
  divider:     { width: 1, height: 18, marginHorizontal: 8 },
  ctrlBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 4 },
  ctrlLabel:   { fontSize: 12, fontWeight: '500' },
  pageIndicator: { fontSize: 11, marginLeft: 'auto' },
  surahSeparator: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 12, marginTop: 16, marginBottom: 4,
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1, overflow: 'hidden',
  },
  surahSepBar:    { width: 4, alignSelf: 'stretch', borderRadius: 2, marginRight: 12, flexShrink: 0 },
  surahSepInfo:   { flex: 1 },
  surahSepName:   { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  surahSepMeta:   { fontSize: 12 },
  surahSepArabic: { fontSize: 22, textAlign: 'right', lineHeight: 30, flexShrink: 0 },
  footerLoading: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingVertical: 24, gap: 10,
  },
  footerLoadingText: { fontSize: 14 },
  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 40, marginVertical: 24, paddingVertical: 14,
    borderRadius: 30, elevation: 3,
    shadowColor: '#667eea', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6,
  },
  loadMoreText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  endCard: {
    alignItems: 'center', marginHorizontal: 40, marginVertical: 32,
    paddingVertical: 24, borderRadius: 14, borderWidth: 1, gap: 8,
  },
  endArabic: { fontSize: 22, textAlign: 'center' },
  endText:   { fontSize: 13 },
});
