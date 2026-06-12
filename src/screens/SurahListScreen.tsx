// screens/SurahListScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, Alert,
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
import {
  SkeletonBox, LastReadSkeleton, SurahItemSkeleton, SectionHeaderSkeleton, SearchBarSkeleton,
} from '../components/SkeletonLoader';

type Props = { navigation: StackNavigationProp<SurahStackParamList, 'SurahList'> };

interface LastRead {
  surahId:        number;
  surahName:      string;
  surahNameArabic: string;
  ayahNumber:     number;
}

// ─── Hexagonal Badge ──────────────────────────────────────────────────────────

const HexBadge: React.FC<{ number: number }> = ({ number }) => {
  const { colors } = useTheme();
  const c = colors.primary;
  const size = 46;
  const rectSize = size * 0.68;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Three overlapping rects at 0°, 60°, -60° → hexagon */}
      {([0, 60, -60] as const).map((deg) => (
        <View
          key={deg}
          style={{
            position:        'absolute',
            width:           rectSize,
            height:          rectSize,
            backgroundColor: c + '18',
            borderWidth:     1.5,
            borderColor:     c + '50',
            borderRadius:    4,
            transform:       [{ rotate: `${deg}deg` }],
          }}
        />
      ))}
      <Text style={{ color: c, fontSize: 13, fontWeight: '700', zIndex: 1 }}>
        {number}
      </Text>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SurahListScreen({ navigation }: Props) {
  const { colors, isDarkMode } = useTheme();
  const { progressPercent, isCompleted } = useReadingProgress();

  const [chapters,          setChapters]         = useState<Chapter[]>([]);
  const [filteredChapters,  setFilteredChapters] = useState<Chapter[]>([]);
  const [searchQuery,       setSearchQuery]      = useState('');
  const [loading,           setLoading]          = useState(true);
  const [lastRead,          setLastRead]         = useState<LastRead | null>(null);

  // ─ Load chapters once ─────────────────────────────────────────────────────
  useEffect(() => { loadChapters(); }, []);

  // ─ Reload last-read whenever the screen comes into focus ──────────────────
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('lastRead').then(raw => {
        if (raw) setLastRead(JSON.parse(raw));
      }).catch(() => {});
    }, [])
  );

  // ─ Filter ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredChapters(chapters); return; }
    const q = searchQuery.toLowerCase();
    setFilteredChapters(chapters.filter(c =>
      c.name_simple.toLowerCase().includes(q) ||
      c.name_arabic.includes(searchQuery) ||
      c.translated_name.name.toLowerCase().includes(q)
    ));
  }, [searchQuery, chapters]);

  const loadChapters = async () => {
    try {
      setLoading(true);
      const data = await QuranAPI.getChapters();
      setChapters(data);
      setFilteredChapters(data);
    } catch {
      Alert.alert('Error', 'Gagal memuat daftar surah');
    } finally {
      setLoading(false);
    }
  };

  // ─ Surah item ─────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: Chapter }) => (
    <TouchableOpacity
      testID={`surah-item-${item.id}`}
      style={[styles.item, {
        backgroundColor: colors.cardBackground,
        borderColor:     colors.border,
      }]}
      onPress={() => navigation.navigate('SurahDetail', { surah: item })}
      activeOpacity={0.7}
    >
      <HexBadge number={item.id} />

      <View style={styles.info}>
        <View style={styles.nameLine}>
          <Text style={[styles.nameLatin, { color: colors.text }]}>
            {item.name_simple}
          </Text>
          {isCompleted(item.id as number) && (
            <View style={[styles.doneBadge, { backgroundColor: '#22c55e' + '20', borderColor: '#22c55e' + '50' }]}>
              <Ionicons name="checkmark" size={10} color="#22c55e" />
              <Text style={[styles.doneText, { color: '#22c55e' }]}>Selesai</Text>
            </View>
          )}
        </View>
        <Text style={[styles.metaRow, { color: colors.textSecondary }]}>
          {item.translated_name.name.toUpperCase()} · {item.verses_count} AYAT
        </Text>
        {/* Mini progress bar */}
        {(() => {
          const pct = progressPercent(item.id as number);
          if (pct <= 0 || isCompleted(item.id as number)) return null;
          return (
            <View style={[styles.miniTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.miniFill, {
                width: `${pct}%`,
                backgroundColor: colors.primary,
              }]} />
            </View>
          );
        })()}
      </View>

      <Text style={[styles.nameArabic, { color: colors.arabicText }]}>
        {item.name_arabic}
      </Text>
    </TouchableOpacity>
  );

  // ─ List header (Last Read card + section title) ────────────────────────────
  const ListHeader = () => (
    <View>
      {/* ── Last Read card ── */}
      {lastRead && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            const chapter = chapters.find(c => c.id === lastRead.surahId);
            if (chapter) navigation.navigate('SurahDetail', { surah: chapter });
          }}
          style={styles.lastReadWrapper}
        >
          <LinearGradient
            colors={isDarkMode
              ? ['#2D3748', '#4A5568']
              : ['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lastReadCard}
          >
            {/* Left info */}
            <View style={styles.lastReadLeft}>
              <View style={styles.lastReadLabelRow}>
                <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.lastReadLabel}> TERAKHIR DIBACA</Text>
              </View>
              <Text style={styles.lastReadSurah}>{lastRead.surahName}</Text>
              <Text style={styles.lastReadAyah}>Ayah {lastRead.ayahNumber}</Text>
            </View>

            {/* Right: book icon + play button */}
            <View style={styles.lastReadRight}>
              <Ionicons name="book" size={52} color="rgba(255,255,255,0.15)" />
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => {
                  const chapter = chapters.find(c => c.id === lastRead.surahId);
                  if (chapter) navigation.navigate('SurahDetail', { surah: chapter });
                }}
              >
                <Ionicons name="play" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* ── Section title ── */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Daftar Surah</Text>
        <Text style={[styles.viewAll, { color: colors.textSecondary }]}>Lihat Semua ›</Text>
      </View>
    </View>
  );

  // ─ List footer (Recommended card) ─────────────────────────────────────────
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
        Tingkatkan bacaan dengan panduan warna tajwid yang interaktif dan mudah dipahami.
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('TajweedLessons')}
        style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.exploreBtnText}>Jelajahi Panduan</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ─ Skeleton loading state ──────────────────────────────────────────────────
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

  return (
    <View testID="surah-list-container" style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Search bar ── */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBox, {
          backgroundColor: colors.cardBackground,
          borderColor:     colors.border,
        }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            testID="surah-search-input"
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari Surah, Ayah, atau Topik..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={colors.primary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity testID="surah-search-clear" onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── List ── */}
      <FlatList
        testID="surah-list"
        data={filteredChapters}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={!searchQuery ? <ListHeader /> : null}
        ListFooterComponent={!searchQuery && filteredChapters.length > 0 ? <ListFooter /> : null}
        ListEmptyComponent={
          <View testID="surah-list-empty" style={styles.empty}>
            <Ionicons name="search-outline" size={56} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Surah tidak ditemukan</Text>
            <Text style={[styles.emptySubtext, { color: colors.textLight }]}>Coba kata kunci lain</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:     { flex: 1 },

  // Search
  searchSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchBox: {
    flexDirection:    'row',
    alignItems:       'center',
    borderRadius:     14,
    paddingHorizontal: 16,
    paddingVertical:  12,
    borderWidth:      1,
    elevation:        2,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 1 },
    shadowOpacity:    0.06,
    shadowRadius:     4,
  },
  searchIcon:  { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },

  // List
  listContent: { paddingVertical: 4, paddingHorizontal: 16, paddingBottom: 32 },

  // Item
  item: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   14,
    marginVertical:    5,
    borderRadius:      14,
    borderWidth:       1,
    elevation:         2,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 1 },
    shadowOpacity:     0.06,
    shadowRadius:      4,
  },
  info:       { flex: 1, paddingHorizontal: 14 },
  nameLatin:  { fontSize: 16, fontWeight: '600' },
  metaRow:    { fontSize: 12, letterSpacing: 0.2, marginTop: 1 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  doneText: { fontSize: 9, fontWeight: '700' },
  miniTrack: { height: 3, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  miniFill: { height: 3, borderRadius: 2 },
  nameArabic: {
    fontSize:   22,
    fontFamily: 'Amiri-Bold',
    textAlign:  'right',
    lineHeight: 30,
    minWidth:   70,
  },

  // Last Read card
  lastReadWrapper: {
    marginHorizontal: 0,
    marginTop:        8,
    marginBottom:     4,
    borderRadius:     16,
    overflow:         'hidden',
    elevation:        4,
    shadowColor:      '#667eea',
    shadowOffset:     { width: 0, height: 4 },
    shadowOpacity:    0.25,
    shadowRadius:     8,
  },
  lastReadCard: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingVertical:   20,
    borderRadius:      16,
  },
  lastReadLeft:     { flex: 1 },
  lastReadLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  lastReadLabel:    { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  lastReadSurah:    { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  lastReadAyah:     { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  lastReadRight:    { alignItems: 'center', gap: 12 },
  playBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent:  'center',
    alignItems:      'center',
  },

  // Section row
  sectionRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginTop:      20,
    marginBottom:   6,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  viewAll:      { fontSize: 13, fontWeight: '500' },

  // Recommended card
  recommendCard: {
    marginTop:         16,
    marginBottom:      16,
    padding:           20,
    borderRadius:      16,
    borderWidth:       1.5,
  },
  recommendBadge: {
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 0.6,
    marginBottom:  6,
  },
  recommendTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  recommendDesc:  { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  exploreBtn: {
    alignSelf:     'flex-start',
    paddingHorizontal: 20,
    paddingVertical:   10,
    borderRadius:  24,
  },
  exploreBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Empty
  empty:       { paddingTop: 60, alignItems: 'center' },
  emptyText:   { fontSize: 17, fontWeight: '600', marginTop: 14, textAlign: 'center' },
  emptySubtext: { fontSize: 14, marginTop: 6, textAlign: 'center' },
});
