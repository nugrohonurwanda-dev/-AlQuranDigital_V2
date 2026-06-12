// components/ReadingProgressBar.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { ColorScheme } from '../contexts/ThemeContext';

interface Props {
  percent:      number;   // 0–100
  totalVerses:  number;
  highestVerse: number;
  colors:       ColorScheme;
  isDarkMode:   boolean;
}

export default function ReadingProgressBar({
  percent, totalVerses, highestVerse, colors, isDarkMode,
}: Props) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue:         percent,
      duration:        600,
      useNativeDriver: false,
    }).start();
  }, [percent, widthAnim]);

  const barWidth = widthAnim.interpolate({
    inputRange:  [0, 100],
    outputRange: ['0%', '100%'],
  });

  const isComplete = percent >= 95;

  return (
    <View style={styles.wrap}>
      {/* Track */}
      <View style={[styles.track, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <Animated.View style={[
          styles.fill,
          {
            width:           barWidth,
            backgroundColor: isComplete ? '#4ade80' : 'rgba(255,255,255,0.85)',
          },
        ]} />
      </View>

      {/* Label */}
      <Text style={styles.label}>
        {isComplete
          ? '✓ Selesai'
          : `Ayat ${highestVerse} / ${totalVerses}`
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            10,
    paddingHorizontal: 20,
    paddingBottom:  12,
  },
  track: {
    flex:         1,
    height:       4,
    borderRadius: 2,
    overflow:     'hidden',
  },
  fill: {
    height:       4,
    borderRadius: 2,
  },
  label: {
    color:      'rgba(255,255,255,0.8)',
    fontSize:   11,
    fontWeight: '600',
    minWidth:   80,
    textAlign:  'right',
  },
});
