// screens/TajweedDetailScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { TajweedStackParamList } from '../types/navigation';

type Props = {
  navigation: StackNavigationProp<TajweedStackParamList, 'TajweedDetail'>;
  route:      RouteProp<TajweedStackParamList, 'TajweedDetail'>;
};

interface Example {
  arabic:      string;
  latin:       string;
  translation: string;
  highlight:   string;
}

interface Rule {
  name:        string;
  description: string;
  color:       string;
}

interface LessonContent {
  id:          string;
  title:       string;
  arabic:      string;
  definition:  string;
  color:       string;
  rules?:      Rule[];
  examples:    Example[];
  tips:        string[];
}

const LESSON_CONTENT: Record<string, LessonContent> = {
  nun_sukun: {
    id: 'nun_sukun', title: 'Nun Sukun & Tanwin', arabic: 'نْ / ً ٍ ٌ',
    definition: 'Nun sukun (نْ) adalah nun yang tidak berbaris. Tanwin adalah baris double pada akhir kata (ً ٍ ٌ). Keduanya memiliki 4 hukum bacaan.',
    color: '#e53e3e',
    rules: [
      { name: 'Idzhar Halqi',       description: 'Dibaca jelas apabila bertemu: ء ه ع ح غ خ',  color: '#2196F3' },
      { name: 'Idgham Bighunnah',   description: 'Dimasukkan dengan dengung apabila bertemu: ي ن م و', color: '#9C27B0' },
      { name: 'Idgham Bilaghunnah', description: 'Dimasukkan tanpa dengung apabila bertemu: ل ر', color: '#e53e3e' },
      { name: 'Iqlab',              description: 'Ditukar menjadi mim apabila bertemu: ب', color: '#00BCD4' },
      { name: 'Ikhfa Haqiqi',       description: 'Disamarkan apabila bertemu 15 huruf ikhfa',  color: '#4CAF50' },
    ],
    examples: [
      { arabic: 'مَنْ آمَنَ',   latin: 'man aamana',    translation: 'barang siapa beriman',  highlight: 'نْ أ' },
      { arabic: 'مِن نَّعِيمٍ', latin: 'min na\'iim',   translation: 'dari kenikmatan',       highlight: 'نْ نّ' },
      { arabic: 'مِن لَّدُنْكَ', latin: 'min ladunka',   translation: 'dari sisi-Mu',          highlight: 'نْ لّ' },
      { arabic: 'مِن بَعْدِ',   latin: 'min ba\'di',    translation: 'setelah',               highlight: 'نْ ب' },
      { arabic: 'مِنكُم',       latin: 'minkum',        translation: 'di antara kamu',        highlight: 'نْ ك' },
    ],
    tips: [
      'Hafal huruf setiap hukum agar mudah mengenali',
      'Perhatikan tanda baca di atas/bawah huruf',
      'Latihan dengan surah-surah pendek terlebih dahulu',
    ],
  },
  mad: {
    id: 'mad', title: 'Mad (Pemanjangan)', arabic: 'ا و ي',
    definition: 'Mad adalah pemanjangan suara pada huruf mad (ا و ي). Terdapat berbagai jenis mad dengan panjang bacaan yang berbeda-beda.',
    color: '#4facfe',
    rules: [
      { name: 'Mad Thabi\'i',         description: 'Mad asli, panjang 2 harakat',                          color: '#4CAF50' },
      { name: 'Mad Wajib Muttashil',  description: 'Mad bertemu hamzah dalam satu kata, 4-5 harakat',       color: '#00BCD4' },
      { name: 'Mad Jaiz Munfashil',   description: 'Mad bertemu hamzah di lain kata, 2-5 harakat',          color: '#4CAF50' },
      { name: 'Mad Lazim',            description: 'Mad bertemu sukun/tasydid, 6 harakat',                  color: '#9C27B0' },
      { name: 'Mad Silah',            description: 'Ha dhamir bertemu huruf berbaris, 2/4-5 harakat',       color: '#2196F3' },
    ],
    examples: [
      { arabic: 'الرَّحْمَٰنِ', latin: 'ar-rahmaani',  translation: 'Yang Maha Pengasih', highlight: 'الرَّحْمَٰ' },
      { arabic: 'قَالُوا',       latin: 'qaalu',         translation: 'mereka berkata',    highlight: 'الو' },
      { arabic: 'فِي',           latin: 'fii',           translation: 'di dalam',          highlight: 'ي' },
      { arabic: 'جَآءَ',         latin: 'jaa-a',         translation: 'dia datang',        highlight: 'آ' },
    ],
    tips: [
      'Gunakan metronome untuk melatih ketepatan panjang bacaan',
      'Dengarkan rekaman qari terpercaya sebagai referensi',
      'Mad Thabi\'i adalah dasar dari semua jenis mad',
    ],
  },
  qalqalah: {
    id: 'qalqalah', title: 'Qalqalah', arabic: 'قطبجد',
    definition: 'Qalqalah adalah hukum bacaan memantulkan suara pada huruf qalqalah (ق ط ب ج د) ketika huruf tersebut sukun atau diwaqafkan.',
    color: '#2196f3',
    rules: [
      { name: 'Qalqalah Sugra',  description: 'Huruf qalqalah sukun di tengah kata, pantulan ringan',   color: '#2196F3' },
      { name: 'Qalqalah Kubra',  description: 'Huruf qalqalah di akhir kata/waqaf, pantulan kuat',      color: '#e53e3e' },
    ],
    examples: [
      { arabic: 'يَخْلُقْكُمْ',  latin: 'yakhluqkum',   translation: 'Dia menciptakan kamu',    highlight: 'قْ' },
      { arabic: 'قَدْ أَفْلَحَ', latin: 'qad aflaha',   translation: 'sungguh beruntung',        highlight: 'دْ' },
      { arabic: 'أَحَطتُ',       latin: 'ahatthu',       translation: 'aku meliputi',             highlight: 'طْ' },
    ],
    tips: [
      'Bayangkan memantulkan bola saat mengucapkan huruf qalqalah',
      'Qalqalah Kubra lebih kuat dari Sugra',
      'Latihan di depan cermin untuk melihat gerakan mulut',
    ],
  },
};

// Default content untuk lesson yang belum dibuat
const getDefaultContent = (lessonId: string, title: string): LessonContent => ({
  id:         lessonId,
  title:      title,
  arabic:     '',
  definition: `Materi ${title} sedang dalam pengembangan.`,
  color:      '#667eea',
  examples:   [],
  tips:       ['Segera hadir dalam pembaruan berikutnya'],
});

export default function TajweedDetailScreen({ route, navigation }: Props) {
  const { lessonId = '', title = 'Tajwid' } = route.params ?? {};
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'examples' | 'tips'>('overview');

  const content = LESSON_CONTENT[lessonId] ?? getDefaultContent(lessonId, title);
  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'overview', label: 'Penjelasan' },
    { key: 'examples', label: `Contoh (${content.examples.length})` },
    { key: 'tips',     label: 'Tips' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Header gradient */}
      <LinearGradient
        colors={[content.color, content.color + 'BB']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {content.arabic ? (
            <Text style={[styles.headerArabic, { fontFamily: 'Amiri-Bold' }]}>{content.arabic}</Text>
          ) : null}
          <Text style={styles.headerTitle}>{content.title}</Text>
        </View>
      </LinearGradient>

      {/* Tab bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: content.color, borderBottomWidth: 3 }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? content.color : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Overview */}
        {activeTab === 'overview' && (
          <View style={styles.section}>
            <View style={[styles.defCard, { backgroundColor: colors.cardBackground, borderLeftColor: content.color }]}>
              <Text style={[styles.defTitle, { color: content.color }]}>Definisi</Text>
              <Text style={[styles.defText, { color: colors.text }]}>{content.definition}</Text>
            </View>

            {content.rules && content.rules.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Hukum Bacaan</Text>
                {content.rules.map((rule, i) => (
                  <View key={i} style={[styles.ruleCard, { backgroundColor: colors.cardBackground, borderLeftColor: rule.color }]}>
                    <View style={[styles.ruleChip, { backgroundColor: rule.color + '20' }]}>
                      <Text style={[styles.ruleChipText, { color: rule.color }]}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.ruleName, { color: rule.color }]}>{rule.name}</Text>
                      <Text style={[styles.ruleDesc, { color: colors.textSecondary }]}>{rule.description}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Examples */}
        {activeTab === 'examples' && (
          <View style={styles.section}>
            {content.examples.length > 0 ? content.examples.map((ex, i) => (
              <View key={i} style={[styles.exCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={[styles.exNumber, { backgroundColor: content.color }]}>
                  <Text style={styles.exNumberText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exArabic, { color: colors.arabicText, fontFamily: 'Amiri-Bold' }]}>{ex.arabic}</Text>
                  <Text style={[styles.exLatin,  { color: colors.textSecondary }]}>{ex.latin}</Text>
                  <Text style={[styles.exTrans,  { color: colors.textLight }]}>{ex.translation}</Text>
                  {ex.highlight && (
                    <View style={[styles.highlight, { backgroundColor: content.color + '20', borderColor: content.color + '44' }]}>
                      <Text style={[styles.highlightLabel, { color: colors.textLight }]}>Fokus: </Text>
                      <Text style={[styles.highlightArabic, { color: content.color, fontFamily: 'Amiri' }]}>{ex.highlight}</Text>
                    </View>
                  )}
                </View>
              </View>
            )) : (
              <View style={styles.empty}>
                <Ionicons name="book-outline" size={48} color={colors.textLight} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Belum ada contoh</Text>
              </View>
            )}
          </View>
        )}

        {/* Tips */}
        {activeTab === 'tips' && (
          <View style={styles.section}>
            {content.tips.map((tip, i) => (
              <View key={i} style={[styles.tipCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={[styles.tipIcon, { backgroundColor: content.color }]}>
                  <Ionicons name="bulb" size={18} color="#fff" />
                </View>
                <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  header:        { paddingHorizontal: 20, paddingVertical: 24, paddingTop: 48 },
  backBtn:       { marginBottom: 16 },
  headerContent: { alignItems: 'flex-start' },
  headerArabic:  { fontSize: 32, color: '#fff', lineHeight: 44, marginBottom: 4 },
  headerTitle:   { fontSize: 22, fontWeight: '700', color: '#fff' },
  tabBar:        { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  tab:           { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText:       { fontSize: 13, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  section:       { gap: 12, paddingTop: 16 },
  sectionTitle:  { fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  defCard:       { borderRadius: 12, padding: 16, borderLeftWidth: 4, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  defTitle:      { fontSize: 14, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  defText:       { fontSize: 15, lineHeight: 24 },
  ruleCard:      { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, borderLeftWidth: 4, gap: 12, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  ruleChip:      { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  ruleChipText:  { fontSize: 14, fontWeight: '700' },
  ruleName:      { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  ruleDesc:      { fontSize: 13, lineHeight: 18 },
  exCard:        { flexDirection: 'row', gap: 14, borderRadius: 12, padding: 14, borderWidth: 1, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  exNumber:      { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  exNumberText:  { fontSize: 13, fontWeight: '700', color: '#fff' },
  exArabic:      { fontSize: 22, lineHeight: 32, textAlign: 'right', marginBottom: 4 },
  exLatin:       { fontSize: 14, fontStyle: 'italic', marginBottom: 4 },
  exTrans:       { fontSize: 13, marginBottom: 8 },
  highlight:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  highlightLabel:{ fontSize: 12 },
  highlightArabic: { fontSize: 16, lineHeight: 22 },
  tipCard:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 12, padding: 14, borderWidth: 1, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  tipIcon:       { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  tipText:       { flex: 1, fontSize: 15, lineHeight: 22 },
  empty:         { justifyContent: 'center', alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText:     { fontSize: 16, fontWeight: '500' },
});
