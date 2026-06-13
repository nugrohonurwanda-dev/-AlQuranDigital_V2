// components/PressableCard.tsx
import React, { useRef } from 'react';
import { Animated, Pressable, ViewStyle, StyleSheet } from 'react-native';

interface Props {
  onPress:    () => void;
  style?:     ViewStyle | ViewStyle[];
  children:   React.ReactNode;
  testID?:    string;
  scaleDown?: number;   // default 0.97
}

/**
 * Drop-in for TouchableOpacity that adds a spring scale-down press animation.
 */
export default function PressableCard({
  onPress, style, children, testID, scaleDown = 0.97,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue:         scaleDown,
      useNativeDriver: true,
      tension:         300,
      friction:        10,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue:         1,
      useNativeDriver: true,
      tension:         300,
      friction:        10,
    }).start();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
