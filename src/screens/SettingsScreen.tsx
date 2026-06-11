// screens/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Switch, ScrollView, Modal, FlatList, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { useFonts, FontName, FONT_WEIGHTS, FontWeight } from '../contexts/FontContext';
import { useAudio } from '../contexts/AudioContext';
import { SettingsStackParamList } from '../types/navigation';

type Props = { navigation: StackNavigationProp<SettingsStackParamList, 'Settings'> };

const AUDIO_QUALITY_OPTIONS = [
  { id: 'high',     label: 'Tinggi (128kbps)',  description: 'Kualitas terbaik, ukuran file besar' },
  { id: 'standard', label: 'Normal (64kbps)',   description: 'Seimbang antara kualitas dan ukuran' },
  { id: 'low',      label: 'Rendah (32kbps)',   description: 'Ukuran file kecil, koneksi lambat' },
];

const TRANSLATION_OPTIONS = [
  { id: 'id',  label: 'Bahasa Indonesia',      author: 'Kemenag RI' },
  { id: 'en',  label: 'English (Saheeh Intl.)', author: 'Saheeh International' },
  { id: 'ur',  label: 'Urdu (Abul A\'la Maududi)', author: 'Abul A\'la Maududi' },
];

export default function SettingsScreen({ navigation }: Props) {
  const { isDarkMode, colors, toggleDarkMode } = useTheme();
  const {
    arabicFont, fontSize, fontWeight, isLoading: fontLoading,
    availableFonts, updateArabicFont, updateFontSize,
    updateFontWeight, getArabicTextStyle,
  } = useFonts();
  const {
    selectedReciter, audioQuality, availableReciters, isLoading: audioLoading,
    updateReciter, updateAudioQuality, getCurrentReciterName,
  } = useAudio();

  const [showReciterModal,   setShowReciterModal]   = useState(false);
  const [showQualityModal,   setShowQualityModal]   = useState(false);
  const [showFontModal,      setShowFontModal]       = useState(false);
  const [showFontSizeModal,  setShowFontSizeModal]   = useState(false);
  const [tempFontSize,       setTempFontSize]        = useState(fontSize);
  const [selectedTranslation, setSelectedTranslation] = useState('id');
  const [tajwidEnabled,      setTajwidEnabled]       = useState(true);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleFontChange = async (fontName: FontName) => {
    const success = await updateArabicFont(fontName);
    if (success) {
      setShowFontModal(false);
    } else {
      Alert.alert('Error', 'Gagal mengubah font');
    }
  };

  const handleFontSizeSave = async () => {
    const success = await updateFontSize(tempFontSize);
    if (success) {
      setShowFontSizeModal(false);
    } else {
      Alert.alert('Error', 'Gagal mengubah ukuran font');
    }
  };

  const handleFontWeightToggle = async () => {
    const newWeight: FontWeight = fontWeight === FONT_WEIGHTS.BOLD ? FONT_WEIGHTS.NORMAL : FONT_WEIGHTS.BOLD;
    await updateFontWeight(newWeight);
  };

  const handleReciterChange = (id: string) => {
    const success = updateReciter(id);
    if (success) setShowReciterModal(false);
    else Alert.alert('Error', 'Gagal mengubah qari');
  };

  const handleQualityChange = (id: string) => {
    const success = updateAudioQuality(id);
    if (success) setShowQualityModal(false);
    else Alert.alert('Error', 'Gagal mengubah kualitas audio');
  };

  const getCurrentFontLabel   = () => availableFonts.find(f => f.name === arabicFont)?.label ?? 'Amiri';
  const getCurrentQualityLabel = () => AUDIO_QUALITY_OPTIONS.find(q => q.id === audioQuality)?.label ?? 'Normal';

  // ─── Shared components ─────────────────────────────────────────────────────

  const SectionHeader = ({ title, icon }: { title: string; icon: React.ComponentProps<typeof Ionicons>['name'] }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );

  const SettingRow = ({
    title, subtitle, onPress, right, disabled = false,
  }: {
    title: string; subtitle?: string;
    onPress: () => void;
    right?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, {
        borderBottomColor: colors.borderLight,
        opacity: disabled ? 0.5 : 1,
      }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {right ?? null}
    </TouchableOpacity>
  );

  const ModalShell = ({
    visible, title, onClose, children,
  }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.optionBackground }]}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Page header ── */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors.primary }]}>Setelan & Personalisasi</Text>
        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
          Sesuaikan pengalaman membacamu
        </Text>
      </View>

      {/* ══ READING MODE ══════════════════════════════════════════════════════ */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <SectionHeader title="Mode Membaca" icon="color-palette-outline" />

        {/* Font size row with inline slider */}
        <View style={[styles.settingItem, { borderBottomColor: colors.borderLight }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Ukuran Font Arab</Text>
            <View style={styles.sliderRowInline}>
              <Slider
                style={styles.inlineSlider}
                minimumValue={18}
                maximumValue={36}
                value={fontSize}
                onValueChange={val => updateFontSize(Math.round(val))}
                step={1}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
              />
            </View>
          </View>
          <View style={[styles.fontSizeBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.fontSizeBadgeText}>{fontSize}px</Text>
          </View>
        </View>

        {/* Bismillah preview */}
        <View style={[styles.previewBox, {
          backgroundColor: isDarkMode ? colors.optionBackground : '#f7f8ff',
          borderColor:     colors.borderLight,
        }]}>
          <Text style={[getArabicTextStyle(fontSize), {
            color:     colors.bismillah,
            textAlign: 'center',
          }]}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
        </View>

        {/* Tajwid color toggle */}
        <View style={[styles.settingItem, {
          borderBottomColor: 'transparent',
          backgroundColor:   isDarkMode ? colors.optionBackground : colors.background + 'aa',
          borderRadius:      10,
          marginHorizontal:  12,
          marginBottom:      12,
        }]}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Warna Tajwid</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              Panduan warna untuk pelafalan yang tepat
            </Text>
          </View>
          <Switch
            value={tajwidEnabled}
            onValueChange={setTajwidEnabled}
            trackColor={{ false: colors.textLight, true: colors.primary + '80' }}
            thumbColor={tajwidEnabled ? colors.primary : colors.cardBackground}
          />
        </View>

        <SettingRow
          title="Font Arab"
          subtitle={getCurrentFontLabel()}
          onPress={() => setShowFontModal(true)}
          disabled={fontLoading}
          right={<Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
        />
        <SettingRow
          title="Gaya Font"
          subtitle={fontWeight === FONT_WEIGHTS.BOLD ? 'Tebal' : 'Normal'}
          onPress={handleFontWeightToggle}
          disabled={fontLoading}
          right={
            <Switch
              value={fontWeight === FONT_WEIGHTS.BOLD}
              onValueChange={handleFontWeightToggle}
              trackColor={{ false: colors.textLight, true: colors.primary + '80' }}
              thumbColor={fontWeight === FONT_WEIGHTS.BOLD ? colors.primary : colors.cardBackground}
            />
          }
        />
      </View>

      {/* ══ TRANSLATION ═══════════════════════════════════════════════════════ */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <SectionHeader title="Terjemahan" icon="language-outline" />
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Pilih bahasa untuk makna ayat
        </Text>
        {TRANSLATION_OPTIONS.map((opt, idx) => (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.translationOption,
              {
                backgroundColor:
                  selectedTranslation === opt.id
                    ? colors.primary + '15'
                    : 'transparent',
                borderColor:
                  selectedTranslation === opt.id
                    ? colors.primary + '50'
                    : colors.borderLight,
                borderBottomWidth: idx < TRANSLATION_OPTIONS.length - 1 ? 1 : 0,
              },
            ]}
            onPress={() => setSelectedTranslation(opt.id)}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <Text style={[
                styles.settingTitle,
                {
                  color:      selectedTranslation === opt.id ? colors.primary : colors.text,
                  fontWeight: selectedTranslation === opt.id ? '600' : '500',
                },
              ]}>
                {opt.label}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {opt.author}
              </Text>
            </View>
            {selectedTranslation === opt.id && (
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ══ THEME ═════════════════════════════════════════════════════════════ */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <SectionHeader title="Tampilan" icon="moon-outline" />
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Pilih tema yang nyaman di matamu
        </Text>
        <View style={styles.themeRow}>
          {/* Light */}
          <TouchableOpacity
            style={[
              styles.themeCard,
              {
                backgroundColor: '#fff',
                borderColor:     !isDarkMode ? colors.primary : colors.borderLight,
                borderWidth:     !isDarkMode ? 2 : 1,
              },
            ]}
            onPress={() => { if (isDarkMode) toggleDarkMode(); }}
            activeOpacity={0.8}
          >
            <Ionicons name="sunny-outline" size={28} color={!isDarkMode ? colors.primary : '#aaa'} />
            <Text style={[styles.themeLabel, { color: !isDarkMode ? colors.primary : '#888' }]}>
              Terang
            </Text>
          </TouchableOpacity>

          {/* Dark */}
          <TouchableOpacity
            style={[
              styles.themeCard,
              {
                backgroundColor: '#1a202c',
                borderColor:     isDarkMode ? colors.primary : colors.borderLight,
                borderWidth:     isDarkMode ? 2 : 1,
              },
            ]}
            onPress={() => { if (!isDarkMode) toggleDarkMode(); }}
            activeOpacity={0.8}
          >
            <Ionicons name="moon" size={26} color={isDarkMode ? '#fff' : '#aaa'} />
            <Text style={[styles.themeLabel, { color: isDarkMode ? '#fff' : '#888' }]}>
              Gelap
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ══ AUDIO ═════════════════════════════════════════════════════════════ */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <SectionHeader title="Audio" icon="volume-medium-outline" />
        <SettingRow
          title="Qari Default"
          subtitle={getCurrentReciterName()}
          onPress={() => setShowReciterModal(true)}
          disabled={audioLoading}
          right={<Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
        />
        <SettingRow
          title="Kualitas Audio"
          subtitle={getCurrentQualityLabel()}
          onPress={() => setShowQualityModal(true)}
          disabled={audioLoading}
          right={<Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
        />
      </View>

      {/* ══ TAJWID GUIDE ══════════════════════════════════════════════════════ */}
      <TouchableOpacity
        style={[styles.section, styles.tajwidGuideRow, {
          backgroundColor: colors.cardBackground,
          borderColor:     colors.border,
        }]}
        onPress={() => navigation.navigate('TajweedLessons')}
        activeOpacity={0.7}
      >
        <View style={[styles.tajwidIcon, { backgroundColor: colors.primary + '18' }]}>
          <Ionicons name="book-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Panduan Tajwid</Text>
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            Pelajari aturan warna tajwid
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* ══ MORE ═════════════════════════════════════════════════════════════ */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <SectionHeader title="Lainnya" icon="ellipsis-horizontal-circle-outline" />
        <SettingRow
          title="Kelola Data Offline"
          onPress={() => Alert.alert('Info', 'Fitur segera hadir')}
          right={<Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
        />
        <SettingRow
          title="Akun & Sinkronisasi"
          onPress={() => Alert.alert('Info', 'Fitur segera hadir')}
          right={<Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
        />
        <SettingRow title="Versi Aplikasi" subtitle="2.0.0" onPress={() => {}} />
        <SettingRow title="Sumber Data" subtitle="Quran.com API & Equran.id" onPress={() => {}} />
      </View>

      {/* ══ QUOTE CARD ═══════════════════════════════════════════════════════ */}
      <View style={[styles.quoteCard, { backgroundColor: colors.primary }]}>
        <Ionicons name="book" size={32} color="rgba(255,255,255,0.3)" style={{ marginBottom: 10 }} />
        <Text style={styles.quoteText}>
          "Sesungguhnya Al-Qur'an ini memberikan petunjuk kepada (jalan) yang lebih lurus."
        </Text>
        <Text style={styles.quoteRef}>— Al-Isra: 9</Text>
      </View>

      {/* ─── Modals ─────────────────────────────────────────────────────────── */}

      {/* Font */}
      <ModalShell visible={showFontModal} title="Pilih Font Arab" onClose={() => setShowFontModal(false)}>
        <FlatList
          data={availableFonts}
          keyExtractor={f => f.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.modalItem, {
                borderBottomColor: colors.borderLight,
                ...(arabicFont === item.name ? { backgroundColor: colors.primary + '18' } : {}),
              }]}
              onPress={() => handleFontChange(item.name as FontName)}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.modalItemText, {
                  color:      arabicFont === item.name ? colors.primary : colors.text,
                  fontWeight: arabicFont === item.name ? '700' : '400',
                }]}>
                  {item.label}
                </Text>
                <Text style={{
                  fontFamily: item.name === 'System' ? undefined : item.name,
                  fontSize:   18,
                  color:      colors.arabicText,
                  marginTop:  4,
                  textAlign:  'right',
                }}>
                  {item.preview}
                </Text>
              </View>
              {arabicFont === item.name && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          )}
        />
      </ModalShell>

      {/* Reciter */}
      <ModalShell visible={showReciterModal} title="Pilih Qari" onClose={() => setShowReciterModal(false)}>
        <FlatList
          data={Object.entries(availableReciters)}
          keyExtractor={([id]) => id}
          renderItem={({ item: [id, name] }) => (
            <TouchableOpacity
              style={[styles.modalItem, {
                borderBottomColor: colors.borderLight,
                ...(selectedReciter === id ? { backgroundColor: colors.primary + '18' } : {}),
              }]}
              onPress={() => handleReciterChange(id)}
            >
              <Text style={[styles.modalItemText, {
                color:      selectedReciter === id ? colors.primary : colors.text,
                fontWeight: selectedReciter === id ? '700' : '400',
              }]}>
                {name as string}
              </Text>
              {selectedReciter === id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          )}
        />
      </ModalShell>

      {/* Quality */}
      <ModalShell visible={showQualityModal} title="Kualitas Audio" onClose={() => setShowQualityModal(false)}>
        <FlatList
          data={AUDIO_QUALITY_OPTIONS}
          keyExtractor={q => q.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.modalItem, {
                borderBottomColor: colors.borderLight,
                ...(audioQuality === item.id ? { backgroundColor: colors.primary + '18' } : {}),
              }]}
              onPress={() => handleQualityChange(item.id)}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.modalItemText, {
                  color:      audioQuality === item.id ? colors.primary : colors.text,
                  fontWeight: audioQuality === item.id ? '700' : '400',
                }]}>
                  {item.label}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                  {item.description}
                </Text>
              </View>
              {audioQuality === item.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          )}
        />
      </ModalShell>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },

  // Page header
  pageHeader:      { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  pageTitle:       { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  pageSubtitle:    { fontSize: 14 },

  // Section
  section: {
    marginTop:        16,
    marginHorizontal: 16,
    borderRadius:     14,
    overflow:         'hidden',
    elevation:        2,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 1 },
    shadowOpacity:    0.06,
    shadowRadius:     4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingHorizontal: 16,
    paddingTop:    16,
    paddingBottom: 4,
    gap:           8,
  },
  sectionTitle:    { fontSize: 16, fontWeight: '700' },
  sectionDesc:     { fontSize: 13, paddingHorizontal: 16, paddingBottom: 10, lineHeight: 18 },

  // Setting row
  settingItem: {
    flexDirection:     'row',
    alignItems:        'center',
    padding:           14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight:         56,
  },
  settingContent:  { flex: 1 },
  settingTitle:    { fontSize: 15, fontWeight: '500', marginBottom: 2 },
  settingSubtitle: { fontSize: 13 },

  // Font size inline slider
  sliderRowInline: { marginTop: 4 },
  inlineSlider:    { height: 36 },
  fontSizeBadge: {
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      20,
    marginLeft:        8,
    minWidth:          50,
    alignItems:        'center',
  },
  fontSizeBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Preview box
  previewBox: {
    marginHorizontal: 14,
    marginVertical:   10,
    paddingVertical:  16,
    paddingHorizontal: 12,
    borderRadius:     10,
    borderWidth:      1,
  },

  // Translation options
  translationOption: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  // Theme
  themeRow: {
    flexDirection:     'row',
    gap:               12,
    paddingHorizontal: 14,
    paddingBottom:     16,
    paddingTop:        6,
  },
  themeCard: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius:   12,
    gap:            8,
  },
  themeLabel: { fontSize: 14, fontWeight: '600' },

  // Tajwid guide row (special row outside section)
  tajwidGuideRow: {
    flexDirection:     'row',
    alignItems:        'center',
    padding:           14,
    gap:               12,
    borderWidth:       1,
  },
  tajwidIcon: {
    width:          44,
    height:         44,
    borderRadius:   22,
    justifyContent: 'center',
    alignItems:     'center',
  },

  // Quote card
  quoteCard: {
    marginHorizontal: 16,
    marginTop:        16,
    marginBottom:     32,
    borderRadius:     14,
    padding:          20,
    alignItems:       'center',
  },
  quoteText: {
    color:       'rgba(255,255,255,0.9)',
    fontSize:    14,
    lineHeight:  22,
    textAlign:   'center',
    fontStyle:   'italic',
    marginBottom: 8,
  },
  quoteRef: {
    color:      'rgba(255,255,255,0.6)',
    fontSize:   12,
    fontWeight: '600',
  },

  // Modals
  overlay: {
    flex:              1,
    backgroundColor:   'rgba(0,0,0,0.5)',
    justifyContent:    'center',
    alignItems:        'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    width:       '100%',
    maxWidth:    400,
    maxHeight:   '80%',
    borderRadius: 16,
    elevation:   8,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius:  8,
  },
  modalHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    padding:         20,
    paddingBottom:   16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle:    { fontSize: 18, fontWeight: '700' },
  closeBtn:      { padding: 8, borderRadius: 20 },
  modalItem: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    padding:          16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight:        60,
  },
  modalItemText: { fontSize: 15 },
});
