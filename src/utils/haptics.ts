// utils/haptics.ts
// Safe haptic wrapper — tries expo-haptics, falls back to Vibration API.
// Install expo-haptics for richer feedback: npx expo install expo-haptics
import { Vibration, Platform } from 'react-native';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const VIBRATION_MAP: Record<HapticStyle, number> = {
  light:   30,
  medium:  50,
  heavy:   80,
  success: 40,
  warning: 60,
  error:   [0, 60, 40, 60] as any,
};

export async function haptic(style: HapticStyle = 'light'): Promise<void> {
  try {
    const Haptics = require('expo-haptics');
    switch (style) {
      case 'light':   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);   break;
      case 'medium':  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);  break;
      case 'heavy':   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);   break;
      case 'success': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
      case 'warning': await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); break;
      case 'error':   await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);   break;
    }
  } catch {
    // Fallback: Android Vibration API
    if (Platform.OS === 'android') {
      Vibration.vibrate(VIBRATION_MAP[style]);
    }
  }
}
