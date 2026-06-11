// screens/SurahDetailScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, FlatList, StyleSheet, ActivityIndicator,
  Alert, Text, StatusBar, ListRenderItemInfo, ViewToken,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { QuranAPI, Verse, Translation } from '../services/quranAPI';
import { cleanTranslationText } from '../utils/translationCleaner';
import SurahHeader       from '../components/SurahHeader';
import VerseItem         from '../components/VerseItem';
import LoadMoreFooter    from '../components/LoadMoreFooter';
import CompactMusicPlayer from '../components/CompactMusicPlayer';
import { useTheme } from '../contexts/ThemeContext';
import { SurahStackParamList } from '../types/navigation';

type Props = {
  navigation: StackNavigationProp<SurahStackParamList, 'SurahDetail'>;
  route:      RouteProp<SurahStackParamList, 'SurahDetail'>;
};

const PER_PAGE = 50;

export default function SurahDetailScreen({ route, navigation }: Props) {
  const { surah } = route.params;
  const { colors, isDarkMode, gradients } = useTheme();

  const [verses,          setVerses]          = useState<Verse[]>([]);
  const [translations,    setTranslations]    = useState<Translation[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [loadingMore,     setLoadingMore]     = useState(false);
  const [fontSize,        setFontSize]        = useState(28);
  const [showTranslation, setShowTranslation] = useState(true);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [hasMoreData,     setHasMoreData]     = useState(true);

  // ─ Track the topmost visible ayah ─────────────────────────────────────────
  const currentAyahRef = useRef(1);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const first = viewableItems[0].item as Verse;
        if (first?.verse_number) currentAyahRef.current = first.verse_number;
      }
    }
  ).current;

  // ─ Save last read when screen opens ───────────────────────────────────────
  useEffect(() => {
    AsyncStorage.setItem('lastRead', JSON.stringify({
      surahId:         surah.id,
      surahName:       surah.name_simple,
      surahNameArabic: surah.name_arabic,
      ayahNumber:      1,
    })).catch(() => {});
  }, [surah]);

  useEffect(() => { loadContent(); }, []);
  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
  }, [isDarkMode]);

  const loadContent = async (page = 1, isLoadMore = false) => {
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
      Alert.alert('Error', msg, [{ text: 'OK' }], {
        cancelable: true,
        userInterfaceStyle: isDarkMode ? 'dark' : 'light',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (hasMoreData && !loading && !loadingMore) loadContent(currentPage + 1, true);
  };

  const handleAudioError = (verseNumber: number) => {
    Alert.alert(
      'Audio Error',
      `Tidak dapat memutar audio untuk ayat ${verseNumber}. Coba lagi nanti.`,
      [{ text: 'OK' }],
      { cancelable: true, userInterfaceStyle: isDarkMode ? 'dark' : 'light' },
    );
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<Verse>) => {
    const translation = translations.find(
      t => t.verse_number === item.verse_number || t.verse_key === item.verse_key
    ) ?? translations[index];

    return (
      <VerseItem
        verse={item}
        translation={translation}
        fontSize={fontSize}
        showTranslation={showTranslation}
        index={index}
        chapterNumber={surah.id as number}
        showAudio
        theme={{ colors, isDarkMode, gradients }}
        onAudioPlaybackStart={() => {}}
        onAudioPlaybackEnd={() => {}}
        onAudioPlaybackError={err => handleAudioError(item.verse_number)}
      />
    );
  };

  const chapterDataForPlayer = {
    id:              surah.id,
    name:            surah.name_simple,
    name_simple:     surah.name_simple,
    name_complex:    surah.name_complex,
    translated_name: surah.translated_name,
    verses: verses.map((v, i) => ({
      ...v,
      translation: translations.find(
        t => t.verse_number === v.verse_number || t.verse_key === v.verse_key
      ) ?? translations[i],
    })),
  };

  if (loading && verses.length === 0) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.loadingPrimary} style={{ marginBottom: 16 }} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
        Memuat ayat dengan tajweed...
      </Text>
      <Text style={[styles.loadingSubtext, { color: colors.textLight }]}>
        {surah.name_simple}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={verses}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.id?.toString() ?? item.verse_key ?? `${surah.id}-${item.verse_number ?? index}`
        }
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        ListHeaderComponent={
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
        }
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
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={21}
        initialNumToRender={10}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
      />
      <CompactMusicPlayer navigation={navigation} chapterData={chapterDataForPlayer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  loadingText:     { fontSize: 16, fontWeight: '500', textAlign: 'center', marginBottom: 8 },
  loadingSubtext:  { fontSize: 14, textAlign: 'center', fontStyle: 'italic' },
  listContent:     { paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 100 },
  separator:       { height: 1, marginHorizontal: 16, opacity: 0.1, marginVertical: 8 },
  empty:           { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText:       { fontSize: 16, textAlign: 'center' },
});
