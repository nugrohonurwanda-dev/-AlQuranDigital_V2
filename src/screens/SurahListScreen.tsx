// screens/SurahListScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Alert, RefreshControl, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { QuranAPI, Chapter } from '../services/quranAPI';
import { useTheme } from '../contexts/ThemeContext';
import { useReadingProgress } from '../contexts/ReadingProgressContext';
import { SurahStackParamList } from '../types/navigation';
import PressableCard from '../components/PressableCard';
import HighlightText from '../components/HighlightText';
import ScrollToTopFAB from '../components/ScrollToTopFAB';
import {
  SkeletonBox, LastReadSkeleton, SurahItemSkeleton,
  SectionHeaderSkeleton, SearchBarSkeleton,
} from '../components/SkeletonLoader';

type Props = { navigation: StackNavigationProp<SurahStackParamList, 'SurahList'> };

interface LastRead {
  surahId:         number;
  surahName:       string;
  surahNameArabic: string;
  ayahNumber:      number;
}

const RECENT_KEY = '@quran_recent_searches_v1';
const MAX_RECENT = 6;

// ─── Hex badge ────────────────────────────────────────────────────────────────

const HexBadge: React.FC<{ number: number }> = ({ number }) => {
  const { colors } = useTheme();
  const c = colors.primary, size = 46, r = size * 0.68;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {([0, 60, -60] as const).map(deg => (
        <View key={deg} style={{
          position: 'absolute', width: r, height: r,
          backgroundColor: c + '18', borderWidth: 1.5,
          borderColor: c + '50', borderRadius: 4,
          transform: [{ rotate: `${deg}deg` }],
        }} />
      ))}
      <Text style={{ color: c, fontSize: 13, fontWeight: '700', zIndex: 1 }}>{number}</Text>
    </View>
  );
};

// ─── Empty search SVG ─────────────────────────────────────────────────────────

const EmptySearch: React.FC<{ query: string }> = ({ query }) => {
  const { colors } = useTheme();
  return (
    <View style={emptyS.wrap}>
      <View style={[emptyS.circle, { backgroundColor: colors.primary + '12' }]}>
        <Ionicons name="search-outline" size={40} color={colors.primary + '80'} />
      </View>
      <Text style={[emptyS.title, { color: colors.text }]}>Tidak ditemukan</Text>
      <Text style={[emptyS.sub, { color: colors.textSecondary }]}>
        Tidak ada surah yang cocok dengan{'\n'}
        <Text style={{ fontWeight: '600', color: colors.text }}>"{query}"</Text>
      </Text>
    </View>
  );
};

const emptyS = StyleSheet.create({
  wrap:   { paddingTop: 48, alignItems: 'center' },
  circle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title:  { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  sub:    { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

// ─── Error state ──────────────────────────────────────────────────────────────

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const { colors } = useTheme();
  return (
    <View style={errS.wrap}>
      <View style={[errS.circle, { backgroundColor: '#fee2e2' }]}>
        <Ionicons name="cloud-offline-outline" size={40} color="#ef4444" />
      </View>
      <Text style={[errS.title, { color: colors.text }]}>Gagal memuat data</Text>
      <Text style={[errS.sub, { color: colors.textSecondary }]}>
        Periksa koneksi internet kamu, lalu coba lagi.
      </Text>
      <TouchableOpacity
        style={[errS.btn, { backgroundColor: colors.primary }]}
        onPress={onRetry}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={16} color="#fff" />
        <Text style={errS.btnText}>Coba lagi</Text>
      </TouchableOpacity>
    </View>
  );
};

const errS = StyleSheet.create({
  wrap:    { paddingTop: 60, alignItems: 'center', paddingHorizontal: 40 },
  circle:  { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title:   { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  sub:     { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  btn:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SurahListScreen({ navigation }: Props) {
  const { colors, isDarkMode }                  = useTheme();
  const { progressPercent, isCompleted }        = useReadingProgress();

  const [chapters,         setChapters]         = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [searchFocused,    setSearchFocused]    = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [error,            setError]            = useState(false);
  const [lastRead,         setLastRead]         = useState<LastRead | null>(null);
  const [recentSearches,   setRecentSearches]   = useState<string[]>([]);
  const [showFAB,          setShowFAB]          = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const scrollY     = useRef(new Animated.Value(0)).current;

  // ─ Load chapters ──────────────────────────────────────────────────────────
  const loadChapters = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(false);
      const data = await QuranAPI.getChapters();
      setChapters(data);
      setFilteredChapters(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadChapters(); }, []);

  // ─ Reload last-read + recent on focus ────────────────────────────────────
  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('lastRead').then(raw => {
      if (raw) setLastRead(JSON.parse(raw));
    }).catch(() => {});

    AsyncStorage.getItem(RECENT_KEY).then(raw => {
      if (raw) setRecentSearches(JSON.parse(raw));
    }).catch(() => {});
  }, []));

  // ─ Filter ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredChapters(chapters); return; }
    const q = searchQuery.toLowerCase();
    setFilteredChapters(
      chapters.filter(c =>
        c.name_simple.toLowerCase().includes(q) ||
        c.name_arabic.includes(searchQuery) ||
        c.translated_name.name.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, chapters]);

  // ─ Save recent search ─────────────────────────────────────────────────────
  const saveRecentSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) return;
    const updated = [q, ...recentSearches.filter(r => r !== q)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_KEY);
  }, []);

  // ─ Number shortcut ────────────────────────────────────────────────────────
  const numberShortcut = (() => {
    const n = parseInt(searchQuery, 10);
    if (!isNaN(n) && n >= 1 && n <= 114) return chapters.find(c => c.id === n) ?? null;
    return null;
  })();

  // ─ Scroll tracking for FAB ────────────────────────────────────────────────
  const onScroll = useCallback(({ nativeEvent }: any) => {
    setShowFAB(nativeEvent.contentOffset.y > 300);
  }, []);

  // ─ Surah item ─────────────────────────────────────────────────────────────
  const renderItem = useCallback(({ item, index }: { item: Chapter; index: number }) => {
    const pct       = progressPercent(item.id as number);
    const completed = isCompleted(item.id as number);
    const hasQuery  = searchQuery.trim().length > 0;

    return (
      <PressableCard
        testID={`surah-item-${item.id}`}
        onPress={() => {
          if (hasQuery) saveRecentSearch(searchQuery);
          navigation.navigate('SurahDetail', { surah: item });
        }}
        style={[styles.item, {
          backgroundColor: colors.cardBackground,
          borderColor:     colors.border,
        }]}
      >
        <HexBadge number={item.id as number} />

        <View style={styles.info}>
          <View style={styles.nameLine}>
            {hasQuery ? (
              <HighlightText
                text={item.name_simple}
                highlight={searchQuery}
                style={[styles.nameLatin, { color: colors.text }]}
              />
            ) : (
              <Text style={[styles.nameLatin, { color: colors.text }]}>{item.name_simple}</Text>
            )}
            {completed && (
              <View style={[styles.doneBadge, { backgroundColor: '#22c55e20', borderColor: '#22c55e50' }]}>
                <Ionicons name="checkmark" size={10} color="#22c55e" />
                <Text style={[styles.doneText, { color: '#22c55e' }]}>Selesai</Text>
              </View>
            )}
          </View>

          {hasQuery ? (
            <HighlightText
              text={`${item.translated_name.name.toUpperCase()} · ${item.verses_count} AYAT`}
              highlight={searchQuery}
              style={[styles.metaRow, { color: colors.textSecondary }]}
            />
          ) : (
            <Text style={[styles.metaRow, { color: colors.textSecondary }]}>
              {item.translated_name.name.toUpperCase()} · {item.verses_count} AYAT
            </Text>
          )}

          {pct > 0 && !completed && (
            <View style={[styles.miniTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.miniFill, {
                width: `${pct}%` as any,
                backgroundColor: colors.primary,
              }]} />
            </View>
          )}
        </View>

        <Text style={[styles.nameArabic, { color: colors.arabicText }]}>
          {item.name_arabic}
        </Text>
      </PressableCard>
    );
  }, [colors, searchQuery, progressPercent, isCompleted, saveRecentSearch, navigation]);

  // ─ Number shortcut row ────────────────────────────────────────────────────
  const NumberShortcutBanner = () => {
    if (!numberShortcut || !searchQuery.trim()) return null;
    return (
      <TouchableOpacity
        style={[styles.shortcut, {
          backgroundColor: colors.primary + '12',
          borderColor:     colors.primary + '35',
        }]}
        onPress={() => {
          saveRecentSearch(searchQuery);
          navigation.navigate('SurahDetail', { surah: numberShortcut });
        }}
        activeOpacity={0.8}
      >
        <View style={[styles.shortcutBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.shortcutNum}>{numberShortcut.id}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.shortcutTitle, { color: colors.primary }]}>
            Langsung ke Surah {numberShortcut.id}
          </Text>
          <Text style={[styles.shortcutSub, { color: colors.textSecondary }]}>
            {numberShortcut.name_simple} · {numberShortcut.verses_count} ayat
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={colors.primary} />
      </TouchableOpacity>
    );
  };

  // ─ Recent searches ────────────────────────────────────────────────────────
  const RecentSearches = () => {
    if (!searchFocused || searchQuery.length > 0 || recentSearches.length === 0) return null;
    return (
      <View style={[styles.recentWrap, {
        backgroundColor: colors.cardBackground,
        borderColor:     colors.border,
      }]}>
        <View style={styles.recentHeader}>
          <Text style={[styles.recentLabel, { color: colors.textSecondary }]}>Pencarian terakhir</Text>
          <TouchableOpacity onPress={clearRecentSearches}>
            <Text style={[styles.recentClear, { color: colors.textLight }]}>Hapus</Text>
          </TouchableOpacity>
        </View>
        {recentSearches.map((r, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.recentItem, { borderTopColor: colors.borderLight }]}
            onPress={() => setSearchQuery(r)}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={15} color={colors.textLight} />
            <Text style={[styles.recentText, { color: colors.text }]}>{r}</Text>
            <TouchableOpacity
              onPress={() => {
                const updated = recentSearches.filter(s => s !== r);
                setRecentSearches(updated);
                AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated)).catch(() => {});
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={14} color={colors.textLight} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // ─ Last Read card ─────────────────────────────────────────────────────────
  const LastReadCard = () => {
    if (!lastRead) return null;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          const chapter = chapters.find(c => c.id === lastRead.surahId);
          if (chapter) navigation.navigate('SurahDetail', {
            surah: chapter, scrollToVerse: lastRead.ayahNumber,
          });
        }}
        style={styles.lastReadWrapper}
      >
        <LinearGradient
          colors={isDarkMode ? ['#2D3748', '#4A5568'] : ['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.lastReadCard}
        >
          <View style={styles.lastReadLeft}>
            <View style={styles.lastReadLabelRow}>
              <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.lastReadLabel}> TERAKHIR DIBACA</Text>
            </View>
            <Text style={styles.lastReadSurah}>{lastRead.surahName}</Text>
            <Text style={styles.lastReadAyah}>Ayah {lastRead.ayahNumber}</Text>
          </View>
          <View style={styles.lastReadRight}>
            <Ionicons name="book" size={52} color="rgba(255,255,255,0.15)" />
            <View style={styles.playBtn}>
              <Ionicons name="play" size={18} color={colors.primary} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // ─ List header ────────────────────────────────────────────────────────────
  const ListHeader = () => (
    <View>
      <LastReadCard />
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Daftar Surah</Text>
        <Text style={[styles.viewAll, { color: colors.textSecondary }]}>Lihat Semua ›</Text>
      </View>
    </View>
  );

  // ─ List footer: Recommended Tajwid ───────────────────────────────────────
  const ListFooter = () => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate('TajweedLessons')}
      style={[styles.recommendCard, {
        backgroundColor: colors.primary + '10',
        borderColor:     colors.primary + '30',
      }]}
    >
      <Text style={[styles.recommendBadge, { color: colors.primary }]}>REKOMENDASI</Text>
      <Text style={[styles.recommendTitle, { color: colors.primary }]}>Panduan Tajwid</Text>
      <Text style={[styles.recommendDesc, { color: colors.textSecondary }]}>
        Tingkatkan bacaan dengan panduan warna tajwid yang interaktif.
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('TajweedLessons')}
        style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.exploreBtnText}>Jelajahi Panduan</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ─ Skeleton loading ───────────────────────────────────────────────────────
  if (loading) return (
    <View testID="surah-list-loading"
      style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBarSkeleton />
      <View style={{ paddingHorizontal: 16 }}>
        <LastReadSkeleton />
        <SectionHeaderSkeleton />
        {Array.from({ length: 8 }).map((_, i) => <SurahItemSkeleton key={i} />)}
      </View>
    </View>
  );

  // ─ Error state ────────────────────────────────────────────────────────────
  if (error && chapters.length === 0) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ErrorState onRetry={() => loadChapters()} />
    </View>
  );

  return (
    <View testID="surah-list-container"
      style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Search bar ── */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBox, {
          backgroundColor: colors.cardBackground,
          borderColor:     searchFocused ? colors.primary + '60' : colors.border,
        }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            testID="surah-search-input"
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari Surah, Ayah, atau nomor 1–114…"
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            selectionColor={colors.primary}
            returnKeyType="search"
            onSubmitEditing={() => { if (searchQuery.trim()) saveRecentSearch(searchQuery); }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity testID="surah-search-clear" onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Recent searches dropdown */}
        <RecentSearches />
      </View>

      {/* Number shortcut banner */}
      {searchQuery.trim() && (
        <View style={{ paddingHorizontal: 16 }}>
          <NumberShortcutBanner />
        </View>
      )}

      {/* ── List ── */}
      <FlatList
        ref={flatListRef}
        testID="surah-list"
        data={filteredChapters}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={!searchQuery ? <ListHeader /> : null}
        ListFooterComponent={
          !searchQuery && filteredChapters.length > 0 ? <ListFooter /> : null
        }
        ListEmptyComponent={
          searchQuery ? <EmptySearch query={searchQuery} /> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadChapters(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScroll={onScroll}
        scrollEventThrottle={150}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      {/* Scroll to top FAB */}
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
  container:     { flex: 1 },
  searchSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, zIndex: 10 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  searchIcon:  { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  listContent: { paddingVertical: 4, paddingHorizontal: 16, paddingBottom: 32 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    marginVertical: 5, borderRadius: 14, borderWidth: 1,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  info:      { flex: 1, paddingHorizontal: 14 },
  nameLine:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  nameLatin: { fontSize: 16, fontWeight: '600' },
  doneBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1,
  },
  doneText:  { fontSize: 9, fontWeight: '700' },
  metaRow:   { fontSize: 12, letterSpacing: 0.2, marginTop: 1 },
  miniTrack: { height: 3, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  miniFill:  { height: 3, borderRadius: 2 },
  nameArabic: {
    fontSize: 22, fontFamily: 'Amiri-Bold',
    textAlign: 'right', lineHeight: 30, minWidth: 70,
  },
  // Number shortcut
  shortcut: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  shortcutBadge: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  shortcutNum:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  shortcutTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  shortcutSub:   { fontSize: 12 },
  // Recent searches
  recentWrap: {
    marginTop: 6, borderRadius: 12, borderWidth: 1,
    overflow: 'hidden', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6,
  },
  recentHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
  },
  recentLabel:  { fontSize: 12, fontWeight: '500' },
  recentClear:  { fontSize: 12 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  recentText:   { flex: 1, fontSize: 14 },
  // Last Read
  lastReadWrapper: {
    marginHorizontal: 0, marginTop: 8, marginBottom: 4,
    borderRadius: 16, overflow: 'hidden', elevation: 4,
    shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8,
  },
  lastReadCard: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 20, borderRadius: 16,
  },
  lastReadLeft:     { flex: 1 },
  lastReadLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  lastReadLabel:    { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  lastReadSurah:    { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  lastReadAyah:     { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  lastReadRight:    { alignItems: 'center', gap: 12 },
  playBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 20, marginBottom: 6,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  viewAll:      { fontSize: 13, fontWeight: '500' },
  recommendCard: {
    marginTop: 16, marginBottom: 16, padding: 20,
    borderRadius: 16, borderWidth: 1.5,
  },
  recommendBadge: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6 },
  recommendTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  recommendDesc:  { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  exploreBtn:     { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24 },
  exploreBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
