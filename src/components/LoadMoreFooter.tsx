// components/LoadMoreFooter.tsx
import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  hasMoreData: boolean;
  loading:     boolean;
  onLoadMore:  () => void;
  theme?:      ReturnType<typeof useTheme>;
}

export default function LoadMoreFooter({ hasMoreData, loading, onLoadMore, theme }: Props) {
  const contextTheme = useTheme();
  const { colors, isDarkMode } = theme ?? contextTheme;

  if (!hasMoreData && !loading) return (
    <View style={[styles.endContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.endLine, { backgroundColor: colors.border }]} />
      <Text style={[styles.endText, { color: colors.textSecondary }]}>صَدَقَ اللَّهُ الْعَظِيمُ</Text>
      <Text style={[styles.endSubtext, { color: colors.textLight }]}>Akhir Surah</Text>
      <View style={[styles.endLine, { backgroundColor: colors.border }]} />
    </View>
  );

  return (
    <View style={[styles.footerContainer, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[
          styles.loadMoreButton,
          { backgroundColor: loading ? colors.primaryDark : colors.primary, shadowColor: colors.shadow },
          loading && styles.loadingButton,
        ]}
        onPress={onLoadMore}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.headerText} style={styles.loadingIndicator} />
            <Text style={[styles.loadingText, { color: colors.headerText }]}>جاري التحميل...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Text style={[styles.loadMoreText, { color: colors.headerText }]}>المزيد من الآيات</Text>
            <Text style={[styles.loadMoreSubtext, { color: colors.headerText }]}>Muat Ayat Berikutnya</Text>
          </View>
        )}
      </TouchableOpacity>

      {loading && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.secondary }]} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer:  { paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' },
  loadMoreButton:   { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, minWidth: 200, alignItems: 'center', justifyContent: 'center', ...Platform.select({ ios: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }, android: { elevation: 3 } }) },
  loadingButton:    { opacity: 0.8 },
  buttonContent:    { alignItems: 'center' },
  loadMoreText:     { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 2 },
  loadMoreSubtext:  { fontSize: 12, textAlign: 'center', opacity: 0.9 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loadingIndicator: { marginRight: 10 },
  loadingText:      { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  progressContainer:{ marginTop: 16, width: '60%', alignItems: 'center' },
  progressBar:      { width: '100%', height: 3, borderRadius: 2, overflow: 'hidden' },
  progressFill:     { height: '100%', width: '40%', borderRadius: 2 },
  endContainer:     { paddingVertical: 40, paddingHorizontal: 30, alignItems: 'center' },
  endLine:          { width: 60, height: 1, marginVertical: 12, opacity: 0.3 },
  endText:          { fontSize: 20, fontWeight: '600', textAlign: 'center', fontFamily: Platform.select({ ios: 'Arial', android: 'serif' }), marginVertical: 8, lineHeight: 32 },
  endSubtext:       { fontSize: 14, textAlign: 'center', fontStyle: 'italic', marginTop: 4 },
});
