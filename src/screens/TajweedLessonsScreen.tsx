// screens/TajweedLessonsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, ListRenderItemInfo,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { TajweedStackParamList } from '../types/navigation';

type Props = { navigation: StackNavigationProp<TajweedStackParamList, 'TajweedLessons'> };

interface TajweedLesson {
  id:          string;
  title:       string;
  description: string;
  category:    string;
  color:       string;
  icon:        string;
  arabic:      string;
  examples:    string[];
}

const TAJWEED_LESSONS: TajweedLesson[] = [
  { id: 'nun_sukun',    title: 'Nun Sukun & Tanwin',    description: 'Hukum bacaan nun mati dan tanwin meliputi Idzhar, Idgham, Iqlab, dan Ikhfa.',   category: 'Dasar',    color: '#e53e3e', icon: 'musical-notes', arabic: 'نْ / ً ٍ ٌ', examples: ['إِنْ أَنتُمْ', 'مِن مَّاءٍ'] },
  { id: 'mim_sukun',    title: 'Mim Sukun',             description: 'Hukum bacaan mim mati meliputi Ikhfa Syafawi, Idgham Mimi, dan Idzhar Syafawi.', category: 'Dasar',    color: '#9c27b0', icon: 'text',          arabic: 'مْ',           examples: ['أَمْ بِهِ', 'هُمْ فِيهَا'] },
  { id: 'mad',          title: 'Mad (Pemanjangan)',     description: 'Hukum bacaan mad untuk memanjangkan suara pada huruf mad.',                        category: 'Lanjutan', color: '#4facfe', icon: 'resize',        arabic: 'ا و ي',         examples: ['الرَّحْمَٰنِ', 'قَالُوا'] },
  { id: 'qalqalah',     title: 'Qalqalah',             description: 'Hukum bacaan memantulkan suara pada huruf qalqalah: ق ط ب ج د.',                    category: 'Dasar',    color: '#2196f3', icon: 'pulse',         arabic: 'قطبجد',         examples: ['يَخْلُقْكُمْ', 'قَدْ أَفْلَحَ'] },
  { id: 'tafkhim',      title: 'Tafkhim & Tarqiq',     description: 'Hukum bacaan tebal (tafkhim) dan tipis (tarqiq) pada huruf tertentu.',              category: 'Lanjutan', color: '#38a169', icon: 'volume-high',   arabic: 'ل ر',           examples: ['اللَّهِ', 'الرَّحِيمِ'] },
  { id: 'waqaf',        title: 'Waqaf & Ibtida',       description: 'Hukum berhenti (waqaf) dan memulai (ibtida) dalam membaca Al-Qur\'an.',             category: 'Lanjutan', color: '#e53e3e', icon: 'pause',         arabic: 'م ط ج ز',       examples: ['مـ', 'ط', 'ج'] },
  { id: 'idgham',       title: 'Idgham',               description: 'Hukum memasukkan huruf ke huruf berikutnya: Idgham Bighunnah dan Bilaghunnah.',      category: 'Dasar',    color: '#9c27b0', icon: 'git-merge',     arabic: 'ي ر م ل و ن',  examples: ['مِن نَّعِيمٍ', 'مِن لَّدُنْكَ'] },
  { id: 'ikhfa',        title: 'Ikhfa Haqiqi',         description: 'Hukum menyamarkan bunyi nun sukun/tanwin sebelum 15 huruf ikhfa.',                  category: 'Dasar',    color: '#4caf50', icon: 'eye-off',       arabic: 'ث ج ذ ز س ش...', examples: ['مِنكُم', 'أَنتُمْ'] },
  { id: 'iqlab',        title: 'Iqlab',                description: 'Hukum menukar nun sukun/tanwin menjadi mim apabila bertemu huruf ب.',              category: 'Dasar',    color: '#00bcd4', icon: 'swap-horizontal', arabic: 'ب',             examples: ['مِن بَعْدِ', 'سَمِيعٌ بَصِيرٌ'] },
  { id: 'idzhar',       title: 'Idzhar Halqi',         description: 'Hukum membaca nun sukun/tanwin dengan jelas apabila bertemu huruf halq.',          category: 'Dasar',    color: '#805ad5', icon: 'mic',           arabic: 'ء ه ع ح غ خ',  examples: ['مَنْ آمَنَ', 'عَلِيمٌ خَبِيرٌ'] },
  { id: 'ghunnah',      title: 'Ghunnah',             description: 'Hukum mendengungkan bacaan pada nun dan mim yang bertasydid.',                       category: 'Lanjutan', color: '#9c27b0', icon: 'radio',         arabic: 'نّ مّ',          examples: ['إِنَّ', 'ثُمَّ'] },
  { id: 'lam_syamsiyah', title: 'Lam Syamsiyah & Qamariyah', description: 'Hukum lam alif: Syamsiyah (diidghamkan) dan Qamariyah (dibaca jelas).',       category: 'Dasar',    color: '#e53e3e', icon: 'sunny',         arabic: 'الـ',           examples: ['الشَّمْسُ', 'الْقَمَرُ'] },
];

const CATEGORIES = ['Semua', 'Dasar', 'Lanjutan'];

export default function TajweedLessonsScreen({ navigation }: Props) {
  const { colors, isDarkMode } = useTheme();
  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const filtered = TAJWEED_LESSONS.filter(lesson => {
    const matchSearch   = !searchQuery.trim() ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'Semua' || lesson.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const renderItem = ({ item }: ListRenderItemInfo<TajweedLesson>) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={() => navigation.navigate('TajweedDetail', { lessonId: item.id, title: item.title })}
      activeOpacity={0.7}
    >
      <View style={[styles.cardLeft, { backgroundColor: item.color + '18', borderLeftColor: item.color }]}>
        <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as React.ComponentProps<typeof Ionicons>['name']} size={22} color="#fff" />
        </View>
        <Text style={[styles.arabic, { color: item.color, fontFamily: 'Amiri' }]}>{item.arabic}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: item.color + '22', borderColor: item.color + '44' }]}>
            <Text style={[styles.badgeText, { color: item.color }]}>{item.category}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        {item.examples.length > 0 && (
          <View style={styles.exampleRow}>
            <Text style={[styles.exampleLabel, { color: colors.textLight }]}>Contoh: </Text>
            {item.examples.slice(0, 2).map((ex, i) => (
              <View key={i} style={[styles.exampleChip, { backgroundColor: colors.exampleBackground, borderColor: colors.exampleBorder + '44' }]}>
                <Text style={[styles.exampleText, { color: colors.arabicText, fontFamily: 'Amiri' }]}>{ex}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari materi tajwid..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={colors.primary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter */}
      <View style={styles.filterRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterBtn, { borderColor: colors.border, backgroundColor: selectedCategory === cat ? colors.primary : colors.cardBackground }]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.filterText, { color: selectedCategory === cat ? '#fff' : colors.textSecondary }]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={[styles.filterCount, { color: colors.textLight }]}>{filtered.length} materi</Text>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={64} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Tidak ada materi ditemukan</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  searchSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBox:   { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  searchIcon:  { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 0 },
  filterRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterBtn:   { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText:  { fontSize: 14, fontWeight: '500' },
  filterCount: { marginLeft: 'auto', fontSize: 13 },
  list:        { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card:        { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, overflow: 'hidden', elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  cardLeft:    { width: 80, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8, borderLeftWidth: 4 },
  iconCircle:  { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  arabic:      { fontSize: 16, lineHeight: 22 },
  cardBody:    { flex: 1, padding: 14, paddingLeft: 12 },
  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  title:       { fontSize: 15, fontWeight: '600', flex: 1 },
  badge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  badgeText:   { fontSize: 11, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  exampleRow:  { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  exampleLabel:{ fontSize: 12 },
  exampleChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  exampleText: { fontSize: 14, lineHeight: 20 },
  empty:       { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText:   { fontSize: 16, fontWeight: '500' },
});
