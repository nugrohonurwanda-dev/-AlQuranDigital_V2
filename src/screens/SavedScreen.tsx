// screens/SavedScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, SectionList, TouchableOpacity,
  StyleSheet, Alert, SectionListData,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useBookmarks, BookmarkItem } from '../contexts/BookmarkContext';
import { SavedStackParamList } from '../types/navigation';
import { useFonts } from '../contexts/FontContext';

type Props = { navigation: StackNavigationProp<SavedStackParamList, 'Saved'> };

interface Section {
  surah_id:               number;
  surah_name:             string;
  surah_name_arabic:      string;
  surah_translated_name:  string;
  surah_verses_count:     number;
  surah_revelation_place: string;
  data: BookmarkItem[];
}

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = () => {
  const { colors } = useTheme();
  return (
    <View style={empty.wrap}>
      <View style={[empty.circle, { backgroundColor: colors.primary + '18' }]}>
        <Ionicons name="bookmark-outline" size={44} color={colors.primary} />
      </View>
      <Text style={[empty.title, { color: colors.text }]}>Belum ada yang ditandai</Text>
      <Text style={[empty.sub, { color: colors.textSecondary }]}>
        Buka surah, ketuk ayat, lalu tekan{' '}
        <Text style={{ fontWeight: '600' }}>Tandai</Text> untuk menyimpannya di sini.
      </Text>
    </View>
  );
};

const empty = StyleSheet.create({
  wrap:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, paddingTop: 80 },
  circle: { width: 84, height: 84, borderRadius: 42, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title:  { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  sub:    { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

// ─── Bookmark item ────────────────────────────────────────────────────────────

interface ItemProps {
  item:       BookmarkItem;
  onDelete:   (verseKey: string) => void;
  onNavigate: (item: BookmarkItem) => void;
  colors:     ReturnType<typeof useTheme>['colors'];
  isDarkMode: boolean;
}

const BookmarkRow = ({ item, onDelete, onNavigate, colors, isDarkMode }: ItemProps) => {
  const { getArabicTextStyle } = useFonts();
  const [expanded, setExpanded] = useState(false);

  const dateStr = new Date(item.saved_at).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[row.wrap, {
        backgroundColor: colors.cardBackground,
        borderColor:     colors.border,
      }]}
      onPress={() => onNavigate(item)}
      activeOpacity={0.75}
    >
      {/* Left accent */}
      <View style={[row.accent, { backgroundColor: colors.primary }]} />

      <View style={row.body}>
        {/* Header: badge + meta + date */}
        <View style={row.head}>
          <View style={[row.badge, {
            backgroundColor: colors.primary + '15',
            borderColor:     colors.primary + '40',
          }]}>
            <Text style={[row.badgeNum, { color: colors.primary }]}>{item.verse_number}</Text>
          </View>

          <Text style={[row.date, { color: colors.textLight }]}>{dateStr}</Text>

          <TouchableOpacity
            onPress={() => onDelete(item.verse_key)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[row.delBtn, { backgroundColor: colors.background }]}
          >
            <Ionicons name="trash-outline" size={15} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Arabic text */}
        <Text
          style={[getArabicTextStyle(20), row.arabic, { color: colors.arabicText }]}
          numberOfLines={expanded ? undefined : 2}
        >
          {item.arabic_text}
        </Text>

        {/* Translation */}
        {item.translation_text ? (
          <Text
            style={[row.trans, { color: colors.textSecondary }]}
            numberOfLines={expanded ? undefined : 2}
          >
            {item.translation_text}
          </Text>
        ) : null}

        {/* Expand / collapse */}
        <TouchableOpacity
          onPress={() => setExpanded(v => !v)}
          style={row.expandBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={[row.expandText, { color: colors.primary }]}>
            {expanded ? 'Sembunyikan' : 'Lihat lengkap'}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={13}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginBottom:  10,
    borderRadius:  12,
    borderWidth:   1,
    overflow:      'hidden',
    elevation:     1,
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius:  3,
  },
  accent: { width: 4, flexShrink: 0 },
  body:   { flex: 1, padding: 14 },
  head: {
    flexDirection:  'row',
    alignItems:     'center',
    marginBottom:   10,
    gap:            8,
  },
  badge: {
    width:          30,
    height:         30,
    borderRadius:   15,
    borderWidth:    1.5,
    justifyContent: 'center',
    alignItems:     'center',
  },
  badgeNum:    { fontSize: 12, fontWeight: '700' },
  date:        { flex: 1, fontSize: 11 },
  delBtn: {
    width:          28,
    height:         28,
    borderRadius:   14,
    justifyContent: 'center',
    alignItems:     'center',
  },
  arabic:      { textAlign: 'right', marginBottom: 8, lineHeight: 34 },
  trans:       { fontSize: 13, lineHeight: 20, marginBottom: 8, fontStyle: 'italic' },
  expandBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  expandText:  { fontSize: 12, fontWeight: '500' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SavedScreen({ navigation }: Props) {
  const { colors, isDarkMode }                 = useTheme();
  const { bookmarks, bookmarksBySurah,
          removeBookmark, clearAll, isLoading } = useBookmarks();

  // Build SectionList sections from bookmarksBySurah
  const sections: Section[] = React.useMemo(() => {
    const result: Section[] = [];
    bookmarksBySurah.forEach((items, surahId) => {
      if (items.length === 0) return;
      const first = items[0];
      result.push({
        surah_id:               surahId,
        surah_name:             first.surah_name,
        surah_name_arabic:      first.surah_name_arabic,
        surah_translated_name:  first.surah_translated_name,
        surah_verses_count:     first.surah_verses_count,
        surah_revelation_place: first.surah_revelation_place,
        data:                   items,
      });
    });
    // Sort by latest saved_at in each group (most recent first)
    return result.sort((a, b) => {
      const maxA = Math.max(...a.data.map(i => i.saved_at));
      const maxB = Math.max(...b.data.map(i => i.saved_at));
      return maxB - maxA;
    });
  }, [bookmarksBySurah]);

  // ─ Navigate to verse ──────────────────────────────────────────────────────
  const handleNavigate = useCallback((item: BookmarkItem) => {
    // Build minimal Chapter-like object from stored bookmark data
    const chapter = {
      id:               item.surah_id,
      name_simple:      item.surah_name,
      name_arabic:      item.surah_name_arabic,
      name_complex:     item.surah_name,
      translated_name:  { name: item.surah_translated_name },
      verses_count:     item.surah_verses_count,
      revelation_place: item.surah_revelation_place,
    };
    // Cross-tab navigation → QuranTab > SurahDetail
    (navigation as any).navigate('QuranTab', {
      screen: 'SurahDetail',
      params: { surah: chapter, scrollToVerse: item.verse_number },
    });
  }, [navigation]);

  // ─ Delete handlers ────────────────────────────────────────────────────────
  const handleDelete = useCallback((verseKey: string) => {
    Alert.alert(
      'Hapus Bookmark',
      'Hapus ayat ini dari daftar tersimpan?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive',
          onPress: () => removeBookmark(verseKey) },
      ],
      { cancelable: true },
    );
  }, [removeBookmark]);

  const handleClearAll = () => {
    if (bookmarks.length === 0) return;
    Alert.alert(
      'Hapus Semua',
      `Hapus semua ${bookmarks.length} bookmark?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus Semua', style: 'destructive', onPress: clearAll },
      ],
    );
  };

  // ─ Render helpers ─────────────────────────────────────────────────────────
  const renderItem = useCallback(({ item }: { item: BookmarkItem }) => (
    <BookmarkRow
      item={item}
      onDelete={handleDelete}
      onNavigate={handleNavigate}
      colors={colors}
      isDarkMode={isDarkMode}
    />
  ), [handleDelete, handleNavigate, colors, isDarkMode]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionListData<BookmarkItem, Section> }) => (
      <View style={[sh.wrap, { backgroundColor: colors.background }]}>
        <View style={sh.left}>
          <Text style={[sh.name, { color: colors.text }]}>{section.surah_name}</Text>
          <Text style={[sh.meta, { color: colors.textSecondary }]}>
            {section.surah_translated_name} · {section.data.length} ayat ditandai
          </Text>
        </View>
        <Text style={[sh.arabic, { color: colors.primary, fontFamily: 'Amiri-Bold' }]}>
          {section.surah_name_arabic}
        </Text>
      </View>
    ),
    [colors],
  );

  if (isLoading) return (
    <View style={[styles.container, { backgroundColor: colors.background }]} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header bar with count + clear all */}
      {bookmarks.length > 0 && (
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {bookmarks.length} ayat tersimpan
          </Text>
          <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
            <Text style={[styles.clearAll, { color: colors.textLight }]}>Hapus semua</Text>
          </TouchableOpacity>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={item => item.verse_key}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        contentContainerStyle={[
          styles.listContent,
          bookmarks.length === 0 && styles.flex1,
        ]}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sh = StyleSheet.create({
  wrap: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   10,
    marginBottom:      6,
  },
  left:    { flex: 1 },
  name:    { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  meta:    { fontSize: 12 },
  arabic:  { fontSize: 20, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container:   { flex: 1 },
  flex1:       { flex: 1 },
  topBar: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  countText:   { fontSize: 13 },
  clearAll:    { fontSize: 13 },
  listContent: {
    paddingHorizontal: 16,
    paddingTop:        4,
    paddingBottom:     32,
  },
});
