// screens/TajweedLessonsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, ListRenderItemInfo, ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SurahStackParamList } from '../types/navigation';

// Accept either SurahStack or SettingsStack navigation
type Props = {
  navigation: StackNavigationProp<any>;
};

interface TajweedLesson {
  id:             string;
  title:          string;
  description:    string;
  category:       string;
  color:          string;
  icon:           string;
  arabic:         string;
  transliteration: string;
  examples:       string[];
}

const TAJWEED_LESSONS: TajweedLesson[] = [
  {
    id: 'iqlab', title: 'Iqlab', description: 'Tukar nun sukun/tanwin menjadi mim apabila bertemu huruf ب, dengan dengung.',
    category: 'Dasar', color: '#e56b8c', icon: 'swap-horizontal',
    arabic: 'مِنۢ بَعْدِ', transliteration: 'Min [m] ba\'di',
    examples: ['مِن بَعْدِ', 'سَمِيعٌ بَصِيرٌ'],
  },
  {
    id: 'ikhfa', title: 'Ikhfa', description: 'Samarkan bunyi nun sukun/tanwin saat bertemu 15 huruf ikhfa, menghasilkan suara sengau.',
    category: 'Dasar', color: '#4a9fd4', icon: 'water',
    arabic: 'مَن شَآءَ', transliteration: 'Man [sh]aa\'a',
    examples: ['مِنكُم', 'أَنتُمْ'],
  },
  {
    id: 'qalqalah', title: 'Qalqalah', description: 'Hasilkan bunyi "memantul" atau bergema pada lima huruf (ق ط ب ج د) saat berharakat Sukun.',
    category: 'Dasar', color: '#3b82f6', icon: 'pulse',
    arabic: 'نُفْلِقُ', transliteration: 'Al-Falaq',
    examples: ['يَخْلُقْكُمْ', 'قَدْ أَفْلَحَ'],
  },
  {
    id: 'ghunnah', title: 'Ghunnah', description: 'Tahan dengung hidung selama dua ketukan saat nun (نّ) atau mim (مّ) berharakat Syaddah.',
    category: 'Dasar', color: '#f59e0b', icon: 'radio',
    arabic: 'إِنَّ', transliteration: 'Inna...',
    examples: ['إِنَّ', 'ثُمَّ'],
  },
  {
    id: 'idgham', title: 'Idgham', description: 'Masukkan huruf ke huruf berikutnya: Idgham Bighunnah (dengan dengung) dan Bilaghunnah (tanpa dengung).',
    category: 'Dasar', color: '#8b5cf6', icon: 'git-merge',
    arabic: 'ي ر م ل و ن', transliteration: 'Ya Ra Mim Lam Waw Nun',
    examples: ['مِن نَّعِيمٍ', 'مِن لَّدُنْكَ'],
  },
  {
    id: 'idzhar', title: 'Idzhar Halqi', description: 'Baca nun sukun/tanwin dengan jelas dan nyaring saat bertemu enam huruf halq (tenggorokan).',
    category: 'Dasar', color: '#10b981', icon: 'mic',
    arabic: 'ء ه ع ح غ خ', transliteration: 'Huruf Halq',
    examples: ['مَنْ آمَنَ', 'عَلِيمٌ خَبِيرٌ'],
  },
  {
    id: 'mad', title: 'Mad (Pemanjangan)', description: 'Panjangkan suara pada huruf mad (ا و ي) sesuai dengan ketentuan masing-masing jenis mad.',
    category: 'Lanjutan', color: '#06b6d4', icon: 'resize',
    arabic: 'ا و ي', transliteration: 'Alif, Waw, Ya',
    examples: ['الرَّحْمَٰنِ', 'قَالُوا'],
  },
  {
    id: 'tafkhim', title: 'Tafkhim & Tarqiq', description: 'Tafkhim = tebalkan suara. Tarqiq = tipiskan suara. Berlaku pada huruf tertentu seperti ل dan ر.',
    category: 'Lanjutan', color: '#22c55e', icon: 'volume-high',
    arabic: 'ل ر', transliteration: 'Lam, Ra',
    examples: ['اللَّهِ', 'الرَّحِيمِ'],
  },
  {
    id: 'mim_sukun', title: 'Mim Sukun', description: 'Hukum mim mati: Ikhfa Syafawi (bibir), Idgham Mimi (lebur), dan Idzhar Syafawi (jelas).',
    category: 'Dasar', color: '#a855f7', icon: 'text',
    arabic: 'مْ', transliteration: 'Mim Sukun',
    examples: ['أَمْ بِهِ', 'هُمْ فِيهَا'],
  },
  {
    id: 'waqaf', title: 'Waqaf & Ibtida', description: 'Ketentuan berhenti (waqaf) dan memulai kembali (ibtida) dalam membaca Al-Qur\'an.',
    category: 'Lanjutan', color: '#ef4444', icon: 'pause',
    arabic: 'م ط ج ز', transliteration: 'Tanda Waqaf',
    examples: ['مـ', 'ط', 'ج'],
  },
  {
    id: 'lam_syamsiyah', title: 'Lam Syamsiyah & Qamariyah', description: 'Lam alif Syamsiyah diidghamkan ke huruf berikut. Lam Qamariyah dibaca jelas.',
    category: 'Dasar', color: '#f97316', icon: 'sunny',
    arabic: 'الـ', transliteration: 'Alif Lam',
    examples: ['الشَّمْسُ', 'الْقَمَرُ'],
  },
  {
    id: 'nun_sukun', title: 'Nun Sukun & Tanwin', description: 'Empat hukum: Idzhar (jelas), Idgham (lebur), Iqlab (tukar), dan Ikhfa (samar).',
    category: 'Dasar', color: '#ec4899', icon: 'musical-notes',
    arabic: 'نْ / ً ٍ ٌ', transliteration: 'Nun Sukun / Tanwin',
    examples: ['إِنْ أَنتُمْ', 'مِن مَّاءٍ'],
  },
];

const CATEGORIES = ['Semua', 'Dasar', 'Lanjutan'];

export default function TajweedLessonsScreen({ navigation }: Props) {
  const { colors, isDarkMode } = useTheme();
  const [searchQuery,       setSearchQuery]      = useState('');
  const [selectedCategory,  setSelectedCategory] = useState('Semua');

  const filtered = TAJWEED_LESSONS.filter(lesson => {
    const matchSearch =
      !searchQuery.trim() ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === 'Semua' || lesson.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // ─── Card render ───────────────────────────────────────────────────────────
  const renderItem = ({ item }: ListRenderItemInfo<TajweedLesson>) => (
    <TouchableOpacity
      style={[styles.card, {
        backgroundColor: colors.cardBackground,
        borderColor:     colors.border,
      }]}
      onPress={() =>
        navigation.navigate('TajweedDetail', { lessonId: item.id, title: item.title })
      }
      activeOpacity={0.75}
    >
      {/* Left colored accent bar */}
      <View style={[styles.accentBar, { backgroundColor: item.color }]} />

      <View style={styles.cardInner}>
        {/* Top row: icon + arabic text */}
        <View style={styles.cardTop}>
          <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
            <Ionicons
              name={item.icon as React.ComponentProps<typeof Ionicons>['name']}
              size={18}
              color={item.color}
            />
          </View>

          <View style={styles.arabicBlock}>
            <Text style={[styles.arabicText, { color: item.color, fontFamily: 'Amiri-Bold' }]}>
              {item.arabic}
            </Text>
            <Text style={[styles.transliteration, { color: colors.textSecondary }]}>
              {item.transliteration}
            </Text>
          </View>

          <View style={[styles.categoryBadge, { backgroundColor: item.color + '18', borderColor: item.color + '40' }]}>
            <Text style={[styles.categoryText, { color: item.color }]}>{item.category}</Text>
          </View>
        </View>

        {/* Title + description */}
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Example chips */}
        {item.examples.length > 0 && (
          <View style={styles.exampleRow}>
            {item.examples.slice(0, 2).map((ex, i) => (
              <View
                key={i}
                style={[styles.exampleChip, {
                  backgroundColor: isDarkMode ? colors.optionBackground : colors.background,
                  borderColor:     colors.borderLight,
                }]}
              >
                <Text style={[styles.exampleText, { color: colors.arabicText, fontFamily: 'Amiri' }]}>
                  {ex}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // ─── List header ───────────────────────────────────────────────────────────
  const ListHeader = () => (
    <View>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: colors.primary + '18' }]}>
          <Ionicons name="book" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Panduan Tajwid</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          Tingkatkan bacaan dengan sistem pewarnaan{'\n'}tajwid untuk fokus dan kejelasan
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, {
        backgroundColor: colors.cardBackground,
        borderColor:     colors.border,
      }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Cari hukum tajwid..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          selectionColor={colors.primary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {CATEGORIES.map(cat => {
          const active = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, {
                backgroundColor: active ? colors.primary : colors.cardBackground,
                borderColor:     active ? colors.primary : colors.border,
              }]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterText, {
                color:      active ? '#fff' : colors.textSecondary,
                fontWeight: active ? '700' : '500',
              }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // ─── Pro Tip footer ────────────────────────────────────────────────────────
  const ListFooter = () => (
    <View style={[styles.proTipCard, {
      backgroundColor: isDarkMode ? colors.cardBackground : '#1e293b',
      borderColor:     colors.primary + '40',
    }]}>
      <View style={styles.proTipHeader}>
        <View style={[styles.proTipBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.proTipBadgeText}>PRO TIP</Text>
        </View>
        <Text style={styles.proTipTitle}>Mode Membaca Terfokus</Text>
      </View>
      <Text style={styles.proTipDesc}>
        Aplikasi secara otomatis menerapkan warna-warna ini ke tampilan Mushaf untuk memandu lisan kamu secara real-time.
      </Text>
      <View style={styles.proTipList}>
        {[
          'Highlight tonal muncul hanya saat dibutuhkan, meminimalkan gangguan visual.',
          'Aktifkan/nonaktifkan lapisan Tajwid dari menu Setelan membaca.',
        ].map((tip, i) => (
          <View key={i} style={styles.proTipItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginTop: 1 }} />
            <Text style={styles.proTipItemText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<ListHeader />}
        ListFooterComponent={<ListFooter />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={52} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tidak ditemukan
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  // Hero
  hero: {
    alignItems:    'center',
    paddingTop:    24,
    paddingBottom: 20,
  },
  heroIcon: {
    width:          72,
    height:         72,
    borderRadius:   36,
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   14,
  },
  heroTitle:    { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  heroSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },

  // Search
  searchBox: {
    flexDirection:    'row',
    alignItems:       'center',
    borderRadius:     12,
    paddingHorizontal: 14,
    paddingVertical:  11,
    borderWidth:      1,
    marginBottom:     12,
    elevation:        1,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },

  // Filter chips
  filterRow: { paddingBottom: 14, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical:   7,
    borderRadius:      20,
    borderWidth:       1.5,
  },
  filterText:  { fontSize: 13 },

  // Card
  card: {
    flexDirection:  'row',
    marginBottom:   12,
    borderRadius:   14,
    borderWidth:    1,
    overflow:       'hidden',
    elevation:      2,
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 1 },
    shadowOpacity:  0.07,
    shadowRadius:   4,
  },
  accentBar:   { width: 4 },
  cardInner:   { flex: 1, padding: 14 },

  // Card top row
  cardTop: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    marginBottom:   10,
    gap:            10,
  },
  iconCircle: {
    width:          36,
    height:         36,
    borderRadius:   18,
    justifyContent: 'center',
    alignItems:     'center',
  },
  arabicBlock: { flex: 1 },
  arabicText:  { fontSize: 22, textAlign: 'right', lineHeight: 30 },
  transliteration: { fontSize: 11, textAlign: 'right', marginTop: 2, fontStyle: 'italic' },
  categoryBadge: {
    alignSelf:         'flex-start',
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      8,
    borderWidth:       1,
  },
  categoryText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // Card body
  cardTitle:   { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDesc:    { fontSize: 13, lineHeight: 19 },

  // Example chips
  exampleRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
    marginTop:     10,
  },
  exampleChip: {
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      8,
    borderWidth:       1,
  },
  exampleText: { fontSize: 16, lineHeight: 22 },

  // Pro Tip
  proTipCard: {
    marginTop:    8,
    borderRadius: 14,
    padding:      18,
    borderWidth:  1,
    overflow:     'hidden',
  },
  proTipHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            10,
    marginBottom:   10,
  },
  proTipBadge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      6,
  },
  proTipBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  proTipTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  proTipDesc:  { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 20, marginBottom: 12 },
  proTipList:  { gap: 8 },
  proTipItem:  { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  proTipItemText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 18, flex: 1 },

  // Empty
  empty:     { paddingTop: 48, alignItems: 'center' },
  emptyText: { fontSize: 15, marginTop: 12 },
});
