// components/TajweedLegend.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TajweedColors } from '../utils/tajweedColors';
import { useTheme } from '../contexts/ThemeContext';

export default function TajweedLegend() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Keterangan Warna Tajweed:</Text>
      <View style={styles.grid}>
        {Object.entries(TajweedColors).map(([rule, color]) => {
          if (rule === 'default') return null;
          return (
            <View key={rule} style={[styles.item, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
              <View style={[styles.colorBox, { backgroundColor: color as string, borderColor: colors.border }]} />
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {rule.charAt(0).toUpperCase() + rule.slice(1).replace(/_/g, ' ')}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  title:     { fontSize: 16, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  item:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, minWidth: '48%', marginBottom: 4 },
  colorBox:  { width: 16, height: 16, borderRadius: 4, marginRight: 8, borderWidth: 1 },
  label:     { fontSize: 12, fontWeight: '500', flex: 1 },
});
