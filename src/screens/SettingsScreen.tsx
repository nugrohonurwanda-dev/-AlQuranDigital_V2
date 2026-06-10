// screens/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Switch, ScrollView, Modal, FlatList, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTheme } from '../contexts/ThemeContext';
import { useFonts, FontName, FONT_WEIGHTS, FontWeight } from '../contexts/FontContext';
import { useAudio } from '../contexts/AudioContext';

const AUDIO_QUALITY_OPTIONS = [
  { id: 'high',     label: 'Tinggi (128kbps)',  description: 'Kualitas terbaik, ukuran file besar' },
  { id: 'standard', label: 'Normal (64kbps)',   description: 'Seimbang antara kualitas dan ukuran' },
  { id: 'low',      label: 'Rendah (32kbps)',   description: 'Ukuran file kecil, untuk koneksi lambat' },
];

export default function SettingsScreen() {
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

  const [showReciterModal,  setShowReciterModal]  = useState(false);
  const [showQualityModal,  setShowQualityModal]  = useState(false);
  const [showFontModal,     setShowFontModal]     = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);
  const [tempFontSize,      setTempFontSize]      = useState(fontSize);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleFontChange = async (fontName: FontName) => {
    const success = await updateArabicFont(fontName);
    if (success) {
      setShowFontModal(false);
      Alert.alert('Font Diubah', `Font Arab berhasil diubah ke ${availableFonts.find(f => f.name === fontName)?.label}`);
    } else {
      Alert.alert('Error', 'Gagal mengubah font');
    }
  };

  const handleFontSizeSave = async () => {
    const success = await updateFontSize(tempFontSize);
    if (success) {
      setShowFontSizeModal(false);
      Alert.alert('Ukuran Font Diubah', `Ukuran font berhasil diubah ke ${tempFontSize}px`);
    } else {
      Alert.alert('Error', 'Gagal mengubah ukuran font');
    }
  };

  const handleFontWeightToggle = async () => {
    const newWeight: FontWeight = fontWeight === FONT_WEIGHTS.BOLD ? FONT_WEIGHTS.NORMAL : FONT_WEIGHTS.BOLD;
    const success = await updateFontWeight(newWeight);
    if (success) {
      Alert.alert('Gaya Font Diubah', `Font berhasil diubah ke ${newWeight === FONT_WEIGHTS.BOLD ? 'Tebal' : 'Normal'}`);
    }
  };

  const handleReciterChange = (id: string) => {
    const success = updateReciter(id);
    if (success) {
      setShowReciterModal(false);
      Alert.alert('Qari Diubah', `Qari berhasil diubah ke ${availableReciters[id]}`);
    } else {
      Alert.alert('Error', 'Gagal mengubah qari');
    }
  };

  const handleQualityChange = (id: string) => {
    const success = updateAudioQuality(id);
    if (success) {
      setShowQualityModal(false);
      Alert.alert('Kualitas Audio Diubah', `Kualitas audio berhasil diubah ke ${AUDIO_QUALITY_OPTIONS.find(q => q.id === id)?.label}`);
    } else {
      Alert.alert('Error', 'Gagal mengubah kualitas audio');
    }
  };

  const getCurrentFontLabel = () => availableFonts.find(f => f.name === arabicFont)?.label ?? 'Amiri';
  const getCurrentQualityLabel = () => AUDIO_QUALITY_OPTIONS.find(q => q.id === audioQuality)?.label ?? 'Normal';

  // ─── Shared row component ───────────────────────────────────────────────────

  const SettingRow = ({
    title, subtitle, onPress, right, disabled = false,
  }: {
    title: string; subtitle?: string;
    onPress: () => void;
    right?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border, backgroundColor: colors.cardBackground, opacity: disabled ? 0.6 : 1 }]}
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

  // ─── Modals ─────────────────────────────────────────────────────────────────

  const ModalShell = ({
    visible, title, onClose, children,
  }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.optionBackground }]}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Tampilan */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Tampilan</Text>

        <SettingRow
          title="Mode Gelap" subtitle="Gunakan tema gelap" onPress={toggleDarkMode}
          right={<Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: colors.textLight, true: colors.primary + '80' }} thumbColor={isDarkMode ? colors.headerText : colors.cardBackground} />}
        />
        <SettingRow
          title="Font Arab" subtitle={getCurrentFontLabel()} onPress={() => setShowFontModal(true)} disabled={fontLoading}
          right={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
        />
        <SettingRow
          title="Ukuran Font" subtitle={`${fontSize}px`} onPress={() => { setTempFontSize(fontSize); setShowFontSizeModal(true); }} disabled={fontLoading}
          right={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
        />
        <SettingRow
          title="Gaya Font" subtitle={fontWeight === FONT_WEIGHTS.BOLD ? 'Tebal' : 'Normal'} onPress={handleFontWeightToggle} disabled={fontLoading}
          right={<Switch value={fontWeight === FONT_WEIGHTS.BOLD} onValueChange={handleFontWeightToggle} trackColor={{ false: colors.textLight, true: colors.primary + '80' }} thumbColor={fontWeight === FONT_WEIGHTS.BOLD ? colors.headerText : colors.cardBackground} />}
        />
      </View>

      {/* Audio */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Audio</Text>

        <SettingRow
          title="Qari Default" subtitle={getCurrentReciterName()} onPress={() => setShowReciterModal(true)} disabled={audioLoading}
          right={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
        />
        <SettingRow
          title="Kualitas Audio" subtitle={getCurrentQualityLabel()} onPress={() => setShowQualityModal(true)} disabled={audioLoading}
          right={<Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
        />
      </View>

      {/* Tentang */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground, marginBottom: 32 }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Tentang</Text>
        <SettingRow title="Versi Aplikasi" subtitle="2.0.0" onPress={() => {}} />
        <SettingRow title="Sumber Data" subtitle="Quran.com API & Equran.id" onPress={() => {}} />
      </View>

      {/* ─── Modals ─── */}

      {/* Font */}
      <ModalShell visible={showFontModal} title="Pilih Font Arab" onClose={() => setShowFontModal(false)}>
        <FlatList
          data={availableFonts}
          keyExtractor={f => f.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.modalItem, { borderBottomColor: colors.borderLight }, arabicFont === item.name && { backgroundColor: colors.primary + '20' }]}
              onPress={() => handleFontChange(item.name as FontName)}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.modalItemText, { color: arabicFont === item.name ? colors.primary : colors.text }, arabicFont === item.name && { fontWeight: 'bold' }]}>
                  {item.label}
                </Text>
                <Text style={{ fontFamily: item.name === 'System' ? undefined : item.name, fontSize: 18, color: colors.arabicText, marginTop: 4, textAlign: 'right' }}>
                  {item.preview}
                </Text>
              </View>
              {arabicFont === item.name && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          )}
        />
      </ModalShell>

      {/* Font size */}
      <ModalShell visible={showFontSizeModal} title="Ukuran Font" onClose={() => setShowFontSizeModal(false)}>
        <View style={styles.fontSizeContent}>
          <Text style={[styles.fontSizeLabel, { color: colors.text }]}>Ukuran: {Math.round(tempFontSize)}px</Text>
          <View style={styles.sliderRow}>
            <Text style={[styles.sliderEdge, { color: colors.textSecondary }]}>12</Text>
            <Slider style={styles.slider} minimumValue={12} maximumValue={32} value={tempFontSize} onValueChange={setTempFontSize} step={1} minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border} />
            <Text style={[styles.sliderEdge, { color: colors.textSecondary }]}>32</Text>
          </View>
          <View style={[styles.preview, { backgroundColor: colors.exampleBackground, borderColor: colors.border }]}>
            <Text style={[getArabicTextStyle(Math.round(tempFontSize)), { color: colors.bismillah, textAlign: 'center' }]}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.border }]} onPress={() => { setTempFontSize(fontSize); setShowFontSizeModal(false); }}>
              <Text style={[styles.btnText, { color: colors.text }]}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleFontSizeSave}>
              <Text style={[styles.btnText, { color: colors.headerText }]}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ModalShell>

      {/* Reciter */}
      <ModalShell visible={showReciterModal} title="Pilih Qari" onClose={() => setShowReciterModal(false)}>
        <FlatList
          data={Object.entries(availableReciters)}
          keyExtractor={([id]) => id}
          renderItem={({ item: [id, name] }) => (
            <TouchableOpacity
              style={[styles.modalItem, { borderBottomColor: colors.borderLight }, selectedReciter === id && { backgroundColor: colors.primary + '20' }]}
              onPress={() => handleReciterChange(id)}
            >
              <Text style={[styles.modalItemText, { color: selectedReciter === id ? colors.primary : colors.text }, selectedReciter === id && { fontWeight: 'bold' }]}>
                {name}
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
              style={[styles.modalItem, { borderBottomColor: colors.borderLight }, audioQuality === item.id && { backgroundColor: colors.primary + '20' }]}
              onPress={() => handleQualityChange(item.id)}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.modalItemText, { color: audioQuality === item.id ? colors.primary : colors.text }, audioQuality === item.id && { fontWeight: 'bold' }]}>
                  {item.label}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{item.description}</Text>
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
  container:      { flex: 1 },
  section:        { marginTop: 20, marginHorizontal: 16, borderRadius: 12, elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  sectionTitle:   { fontSize: 18, fontWeight: '600', padding: 16, paddingBottom: 8 },
  settingItem:    { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 60 },
  settingContent: { flex: 1 },
  settingTitle:   { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  settingSubtitle:{ fontSize: 14 },
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  modalCard:      { width: '100%', maxWidth: 400, maxHeight: '80%', borderRadius: 16, elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  modalTitle:     { fontSize: 20, fontWeight: '600' },
  closeBtn:       { padding: 8, borderRadius: 20 },
  modalItem:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 60 },
  modalItemText:  { fontSize: 16 },
  fontSizeContent:{ padding: 20 },
  fontSizeLabel:  { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 24 },
  sliderRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  sliderEdge:     { fontSize: 12, minWidth: 30, textAlign: 'center', fontWeight: '500' },
  slider:         { flex: 1, marginHorizontal: 12, height: 40 },
  preview:        { padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  btnRow:         { flexDirection: 'row', gap: 12 },
  btn:            { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnText:        { fontSize: 16, fontWeight: '600' },
});
