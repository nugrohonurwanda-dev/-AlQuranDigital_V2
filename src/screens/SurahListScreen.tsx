// screens/SurahListScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { QuranAPI, Chapter } from '../services/quranAPI';
import { useTheme } from '../contexts/ThemeContext';
import { SurahStackParamList } from '../types/navigation';

type Props = { navigation: StackNavigationProp<SurahStackParamList, 'SurahList'> };

export default function SurahListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [chapters,         setChapters]         = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [loading,          setLoading]          = useState(true);

  useEffect(() => { loadChapters(); }, []);

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

  const renderItem = ({ item }: { item: Chapter }) => (
    <TouchableOpacity
      testID={`surah-item-${item.id}`}
      style={[styles.item, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={() => navigation.navigate('SurahDetail', { surah: item })}
      activeOpacity={0.7}
    >
      <View style={[styles.numberBadge, { backgroundColor: colors.primary }]}>
        <Text testID={`surah-number-${item.id}`} style={[styles.numberText, { color: colors.headerText }]}>
          {item.id}
        </Text>
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <View style={styles.textInfo}>
            <Text testID={`surah-name-latin-${item.id}`} style={[styles.nameLatin, { color: colors.text }]}>
              {item.name_simple}
            </Text>
            <Text testID={`surah-translation-${item.id}`} style={[styles.translation, { color: colors.textSecondary }]}>
              {item.translated_name.name}
            </Text>
          </View>
          <Text testID={`surah-name-arabic-${item.id}`} style={[styles.nameArabic, { color: colors.arabicText }]}>
            {item.name_arabic}
          </Text>
        </View>
        <Text testID={`surah-details-${item.id}`} style={[styles.details, { color: colors.textLight }]}>
          {item.revelation_place} • {item.verses_count} Ayat
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  if (loading) return (
    <View testID="surah-list-loading" style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.loadingPrimary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat Al-Qur'an...</Text>
    </View>
  );

  return (
    <View testID="surah-list-container" style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={styles.searchSection}>
        <View style={[styles.searchBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            testID="surah-search-input"
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari surah..."
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

      <FlatList
        testID="surah-list"
        data={filteredChapters}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {filteredChapters.length === 0 && (
        <View testID="surah-list-empty" style={styles.empty}>
          <Ionicons name="search-outline" size={64} color={colors.textLight} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Tidak ada surah ditemukan</Text>
          <Text style={[styles.emptySubtext, { color: colors.textLight }]}>Coba gunakan kata kunci lain</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:   { marginTop: 16, fontSize: 16, fontWeight: '500' },
  searchSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBox:     { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  searchIcon:    { marginRight: 12 },
  searchInput:   { flex: 1, fontSize: 16, paddingVertical: 0 },
  listContent:   { paddingVertical: 8 },
  item:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, marginHorizontal: 16, marginVertical: 6, borderRadius: 12, borderWidth: 1, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  numberBadge:   { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  numberText:    { fontSize: 16, fontWeight: 'bold' },
  info:          { flex: 1, paddingRight: 12 },
  row:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  textInfo:      { flex: 1, paddingRight: 12 },
  nameLatin:     { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  translation:   { fontSize: 14 },
  nameArabic:    { fontSize: 20, fontFamily: 'Amiri-Bold', textAlign: 'right', lineHeight: 26, minWidth: 80 },
  details:       { fontSize: 13, opacity: 0.8 },
  empty:         { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  emptyText:     { fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' },
  emptySubtext:  { fontSize: 14, marginTop: 8, textAlign: 'center' },
});
