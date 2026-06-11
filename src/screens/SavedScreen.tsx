// screens/SavedScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function SavedScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.emptyBox}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18' }]}>
          <Ionicons name="bookmark-outline" size={44} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Belum ada yang tersimpan</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tandai ayat yang ingin kamu baca ulang.{'\n'}Semuanya akan muncul di sini.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox:   { alignItems: 'center', paddingHorizontal: 40 },
  iconCircle: {
    width:         84,
    height:        84,
    borderRadius:  42,
    justifyContent: 'center',
    alignItems:    'center',
    marginBottom:  20,
  },
  title:    { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
