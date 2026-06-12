// screens/SurahDetailScreen.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  Alert, TouchableOpacity, StatusBar,
  ListRenderItemInfo, ViewToken,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { QuranAPI, Verse, Translation } from '../services/quranAPI';
import { cleanTranslationText } from '../utils/translationCleaner';
import SurahHeader        from '../components/SurahHeader';
import VerseItem          from '../components/VerseItem';
import LoadMoreFooter     from '../components/LoadMoreFooter';
import CompactMusicPlayer from '../components/CompactMusicPlayer';
import { useTheme }              from '../contexts/ThemeContext';
import { useBookmarks }          from '../contexts/BookmarkContext';
import { useReadingProgress }    from '../contexts/ReadingProgressContext';
import { SurahStackParamList }   from '../types/navigation';
import {
  VerseItemSkeleton, BismillahSkeleton,
} from '../components/SkeletonLoader';

type Props = {
  navigation: StackNavigationProp<SurahStackParamList, 'SurahDetail'>;
  route:      RouteProp<SurahStackParamList, 'SurahDetail'>;
};

const PER_PAGE = 50;

export default function SurahDetailScreen({ route, navigation }: Props) {
  const { surah, scrollToVerse } = route.params;
  const { colors, isDarkMode, gradients } = useTheme();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { getProgress, updateProgress }               = useReadingProgress();

  const [verses,          setVerses]          = useState<Verse[]>([]);
  const [translations,    setTranslations]    = useState<Translation[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [loadingMore,     setLoadingMore]     = useState(false);
  const [fontSize,        setFontSize]        = useState(28);
  const [showTranslation, setShowTranslation] = useState(true);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [hasMoreData,     setHasMoreData]     = useState(true);

  // "Continue Reading" banner
  const [continueVerse, setContinueVerse] = useState(0);

  // Refs
  const flatListRef     = useRef<FlatList>(null);
  const currentAyahRef  = useRef(1);
  const progressSavedRef = useRef(false);

  // ─ Translation lookup (by verse_key) ─────────────────────────────────────
  const transMap = useMemo(() => {
    const m: Record<string, Translation> = {};
    for (const t of translations) {
      if (t.verse_key) m[t.verse_key] = t;
    }
    return m;
  }, [translations]);

  // ─ Track topmost visible ayah ─────────────────────────────────────────────
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const first = viewableItems[0].item as Verse;
        if (first?.verse_number) {
          currentAyahRef.current = first.verse_number;
        }
      }
    },
  ).current;

  // ─ Load data ──────────────────────────────────────────────────────────────
  const loadContent = useCallback(async (page = 1, isLoadMore = false) => {
    try {
      isLoadMore ? setLoadingMore(true) : setLoading(true);

      const [versesData, translationsData] = await Promise.all([
        QuranAPI.getVersesWithTajweed(surah.id as number, page, PER_PAGE),
        QuranAPI.getTranslations(surah.id as number, page, PER_PAGE),
      ]);

      const cleaned = translationsData.map(t => ({
        ...t,
        text:     cleanTranslationText(t.text),
        raw_text: t.text,
      }));

      if (isLoadMore) {
        setVerses(prev       => [...prev, ...versesData]);
        setTranslations(prev => [...prev, ...cleaned]);
      } else {
        setVerses(versesData);
        setTranslations(cleaned);
      }

      setHasMoreData(versesData.length === PER_PAGE);
      setCurrentPage(page);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal memuat ayat surah';
      Alert.alert('Error', msg, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [surah.id]);

  useEffect(() => {
    loadContent();
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);

    // Save last read for Last Read card on home screen
    AsyncStorage.setItem('lastRead', JSON.stringify({
      surahId:         surah.id,
      surahName:       surah.name_simple,
      surahNameArabic: surah.name_arabic,
      ayahNumber:      1,
    })).catch(() => {});
  }, [surah.id]);

  // ─ Save progress on blur; load continue-banner on focus ───────────────────
  useFocusEffect(
    useCallback(() => {
      // Show "continue reading" banner if there's a saved position
      const prog = getProgress(surah.id as number);
      if (scrollToVerse && scrollToVerse > 1) {
        // Came from bookmark — will scroll when verses load
      } else if (prog && prog.last_verse_number > 3 && !progressSavedRef.current) {
        setContinueVerse(prog.last_verse_number);
      }

      return () => {
        // Save progress when leaving screen
        if (currentAyahRef.current > 0) {
          updateProgress(
            surah.id as number,
            currentAyahRef.current,
            surah.verses_count as number,
          );
          // Also update lastRead ayah
          AsyncStorage.setItem('lastRead', JSON.stringify({
            surahId:         surah.id,
            surahName:       surah.name_simple,
            surahNameArabic: surah.name_arabic,
            ayahNumber:      currentAyahRef.current,
          })).catch(() => {});
          progressSavedRef.current = true;
        }
      };
    }, [surah.id, surah.verses_count, scrollToVerse]),
  );

  // ─ Scroll to specific verse once loaded ───────────────────────────────────
  useEffect(() => {
    if (verses.length > 0 && scrollToVerse && scrollToVerse > 1) {
      const targetIdx = verses.findIndex(v => v.verse_number === scrollToVerse);
      const idx = targetIdx >= 0 ? targetIdx : Math.min(scrollToVerse - 1, verses.length - 1);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index:        idx,
          animated:     true,
          viewPosition: 0.1,
        });
      }, 400);
    }
  }, [verses.length > 0, scrollToVerse]);

  // ─ Scroll helper ──────────────────────────────────────────────────────────
  const scrollToVerseNum = useCallback((verseNum: number) => {
    const idx = verses.findIndex(v => v.verse_number === verseNum);
    const safeIdx = idx >= 0 ? idx : Math.min(verseNum - 1, verses.length - 1);
    flatListRef.current?.scrollToIndex({
      index:        safeIdx,
      animated:     true,
      viewPosition: 0.1,
    });
    setContinueVerse(0);
  }, [verses]);

  // ─ Bookmark toggle ────────────────────────────────────────────────────────
  const handleToggleBookmark = useCallback((verse: Verse) => {
    const vk = verse.verse_key;
    if (isBookmarked(vk)) {
      removeBookmark(vk);
    } else {
      const translation = transMap[vk];
      addBookmark({
        verse_key:              vk,
        surah_id:               surah.id as number,
        surah_name:             surah.name_simple,
        surah_name_arabic:      surah.name_arabic,
        surah_translated_name:  surah.translated_name.name,
        surah_verses_count:     surah.verses_count as number,
        surah_revelation_place: surah.revelation_place ?? '',
        verse_number:           verse.verse_number,
        arabic_text:            verse.text_uthmani ?? '',
        translation_text:       translation?.text ?? '',
        saved_at:               Date.now(),
      });
    }
  }, [surah, isBookmarked, addBookmark, removeBookmark, transMap]);

  const loadMore = () => {
    if (hasMoreData && !loading && !loadingMore) loadContent(currentPage + 1, true);
  };

  const handleAudioError = (verseNumber: number) => {
    Alert.alert('Audio Error', `Tidak dapat memutar audio untuk ayat ${verseNumber}.`);
  };

  // ─ Render verse ───────────────────────────────────────────────────────────
  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<Verse>) => {
    const translation = transMap[item.verse_key] ?? translations[index];
    return (
      <VerseItem
        verse={item}
        translation={translation}
        fontSize={fontSize}
        showTranslation={showTranslation}
        index={index}
        chapterNumber={surah.id as number}
        isBookmarked={isBookmarked(item.verse_key)}
        onToggleBookmark={handleToggleBookmark}
        showAudio
        theme={{ colors, isDarkMode, gradients }}
        onAudioPlaybackStart={() => {}}
        onAudioPlaybackEnd={() => {}}
        onAudioPlaybackError={err => handleAudioError(item.verse_number)}
      />
    );
  }, [
    transMap, translations, fontSize, showTranslation,
    surah.id, isBookmarked, handleToggleBookmark,
    colors, isDarkMode, gradients,
  ]);

  // ─ Continue Reading banner ────────────────────────────────────────────────
  const ContinueBanner = () => {
    if (!continueVerse || continueVerse <= 1) return null;
    return (
      <TouchableOpacity
        style={[banner.wrap, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '35' }]}
        onPress={() => scrollToVerseNum(continueVerse)}
        activeOpacity={0.8}
      >
        <Ionicons name="time-outline" size={16} color={colors.primary} />
        <Text style={[banner.text, { color: colors.primary }]}>
          Terakhir baca: <Text style={banner.bold}>Ayat {continueVerse}</Text>
        </Text>
        <View style={[banner.btn, { backgroundColor: colors.primary }]}>
          <Text style={banner.btnText}>Lanjutkan</Text>
          <Ionicons name="arrow-forward" size={13} color="#fff" />
        </View>
      </TouchableOpacity>
    );
  };

  // ─ Header ─────────────────────────────────────────────────────────────────
  const ListHeaderComponent = useMemo(() => (
    <>
      <SurahHeader
        surah={surah}
        fontSize={fontSize}
        setFontSize={setFontSize}
        showTranslation={showTranslation}
        setShowTranslation={setShowTranslation}
        theme={{ colors, isDarkMode, gradients }}
        minFontSize={20}
        maxFontSize={40}
      />
      <ContinueBanner />
    </>
  ), [surah, fontSize, showTranslation, colors, isDarkMode, continueVerse]);

  // ─ Loading skeleton ───────────────────────────────────────────────────────
  if (loading && verses.length === 0) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SurahHeader
        surah={surah}
        fontSize={fontSize}
        setFontSize={setFontSize}
        showTranslation={showTranslation}
        setShowTranslation={setShowTranslation}
        theme={{ colors, isDarkMode, gradients }}
        minFontSize={20}
        maxFontSize={40}
      />
      <BismillahSkeleton />
      {Array.from({ length: 6 }).map((_, i) => (
        <VerseItemSkeleton key={i} odd={i % 2 !== 0} />
      ))}
    </View>
  );

  const chapterDataForPlayer = {
    id:              surah.id,
    name:            surah.name_simple,
    name_simple:     surah.name_simple,
    name_complex:    surah.name_complex,
    translated_name: surah.translated_name,
    verses: verses.map((v, i) => ({
      ...v,
      translation: transMap[v.verse_key] ?? translations[i],
    })),
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={verses}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.verse_key ?? `${surah.id}-${item.verse_number ?? index}`
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={
          <LoadMoreFooter
            hasMoreData={hasMoreData}
            loading={loadingMore}
            onLoadMore={loadMore}
            theme={{ colors, isDarkMode }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tidak ada ayat yang ditemukan
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={21}
        initialNumToRender={10}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        onScrollToIndexFailed={({ averageItemLength, index }) => {
          flatListRef.current?.scrollToOffset({
            offset:   averageItemLength * index,
            animated: true,
          });
        }}
      />
      <CompactMusicPlayer navigation={navigation} chapterData={chapterDataForPlayer} />
    </View>
  );
}

const banner = StyleSheet.create({
  wrap: {
    flexDirection:     'row',
    alignItems:        'center',
    marginHorizontal:  16,
    marginTop:         10,
    marginBottom:      4,
    padding:           12,
    borderRadius:      12,
    borderWidth:       1,
    gap:               8,
  },
  text:    { flex: 1, fontSize: 13, color: '#667eea' },
  bold:    { fontWeight: '700' },
  btn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingHorizontal: 12,
    paddingVertical:   6,
    borderRadius:      16,
  },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container:   { flex: 1 },
  listContent: { paddingBottom: 100 },
  empty:       { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText:   { fontSize: 16, textAlign: 'center' },
});
