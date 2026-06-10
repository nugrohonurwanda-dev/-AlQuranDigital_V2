// components/TajweedDisplay.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Verse } from '../services/quranAPI';
import TajweedNativeText from './TajweedNativeText';

interface Props {
  verse:               Verse;
  fontSize?:           number;
  verseIndex?:         number;
  enableTajweedColors?: boolean;
  testID?:             string;
  textStyle?:          object;
}

/**
 * TajweedDisplay — renders Arabic text with tajweed colour highlights.
 * Uses TajweedNativeText (native Text segments) for all cases.
 * WebView variant was removed: it caused SDK/Gradle issues and native
 * rendering covers all use-cases needed by this app.
 */
const TajweedDisplay = React.memo(({ verse, fontSize = 18, verseIndex, enableTajweedColors = true, testID }: Props) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]} testID={testID}>
      <TajweedNativeText
        verse={verse}
        fontSize={fontSize}
        verseIndex={verseIndex}
        enableTajweedColors={enableTajweedColors}
        testID={testID ? `${testID}-native` : undefined}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 8, borderRadius: 8, overflow: 'hidden' },
});

export default TajweedDisplay;
