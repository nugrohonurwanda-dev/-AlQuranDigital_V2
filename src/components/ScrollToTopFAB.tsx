// components/ScrollToTopFAB.tsx
import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  visible:      boolean;
  onPress:      () => void;
  bottomExtra?: number;
}

export default function ScrollToTopFAB({ visible, onPress, bottomExtra = 0 }: Props) {
  const { colors }              = useTheme();
  const opacity                 = useRef(new Animated.Value(0)).current;
  const scale                   = useRef(new Animated.Value(0.7)).current;
  // Keep component in tree until fade-out animation completes
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1, duration: 220, useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1, useNativeDriver: true, tension: 120, friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0, duration: 200, useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 0.7, useNativeDriver: true, tension: 120, friction: 8,
        }),
      ]).start(({ finished }) => {
        // Unmount after fade-out — no pointerEvents hack needed
        if (finished) setRendered(false);
      });
    }
  }, [visible]);

  if (!rendered) return null;

  return (
    <Animated.View
      style={[
        styles.wrap,
        { bottom: 24 + bottomExtra, opacity, transform: [{ scale }] },
      ]}
    >
      <TouchableOpacity
        style={[styles.btn, {
          backgroundColor: colors.primary,
          shadowColor:     colors.primary,
        }]}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityLabel="Kembali ke atas"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-up" size={22} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position:  'absolute',
    right:     20,
    zIndex:    99,
  },
  btn: {
    width:          46,
    height:         46,
    borderRadius:   23,
    justifyContent: 'center',
    alignItems:     'center',
    elevation:      6,
    shadowOffset:   { width: 0, height: 3 },
    shadowOpacity:  0.35,
    shadowRadius:   6,
  },
});
