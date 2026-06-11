// utils/clipboard.ts
// Safe clipboard helper — tries expo-clipboard, falls back to Share API.
// To enable native clipboard copy: npx expo install expo-clipboard
import { Share } from 'react-native';

export async function copyToClipboard(text: string): Promise<'copied' | 'shared' | 'failed'> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { setStringAsync } = require('expo-clipboard');
    await setStringAsync(text);
    return 'copied';
  } catch {
    try {
      await Share.share({ message: text });
      return 'shared';
    } catch {
      return 'failed';
    }
  }
}
