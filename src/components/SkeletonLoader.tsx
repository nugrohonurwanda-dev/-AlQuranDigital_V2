// components/SkeletonLoader.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// ─── Base shimmer box ─────────────────────────────────────────────────────────

interface SkeletonBoxProps {
  width?:        number | string;
  height?:       number;
  borderRadius?: number;
  style?:        ViewStyle;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const { isDarkMode } = useTheme();
  const anim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue:         1,
          duration:        900,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue:         0.4,
          duration:        900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const bgColor = isDarkMode ? '#374151' : '#E5EAF0';

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: bgColor, opacity: anim },
        style,
      ]}
    />
  );
};

// ─── Last Read card skeleton ──────────────────────────────────────────────────

export const LastReadSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  const bg = isDarkMode ? '#2D3748' : '#DDE3F0';

  return (
    <View style={[s.lastRead, { backgroundColor: bg }]}>
      <View style={s.lastReadLeft}>
        <SkeletonBox width={130} height={11} borderRadius={6} style={s.mb10} />
        <SkeletonBox width={160} height={26} borderRadius={8} style={s.mb8}  />
        <SkeletonBox width={80}  height={13} borderRadius={6} />
      </View>
      <View style={s.lastReadRight}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
      </View>
    </View>
  );
};

// ─── Surah list item skeleton ─────────────────────────────────────────────────

export const SurahItemSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={[s.surahItem, {
      backgroundColor: colors.cardBackground,
      borderColor:     colors.border,
    }]}>
      <SkeletonBox width={46} height={46} borderRadius={23} style={s.mr14} />
      <View style={s.flex1}>
        <SkeletonBox width="55%" height={16} borderRadius={7}  style={s.mb8} />
        <SkeletonBox width="38%" height={12} borderRadius={6} />
      </View>
      <SkeletonBox width={64} height={22} borderRadius={6} />
    </View>
  );
};

// ─── Juz list item skeleton ───────────────────────────────────────────────────

export const JuzItemSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={[s.surahItem, {
      backgroundColor: colors.cardBackground,
      borderColor:     colors.border,
    }]}>
      <SkeletonBox width={44} height={44} borderRadius={22} style={s.mr14} />
      <View style={s.flex1}>
        <SkeletonBox width="40%" height={16} borderRadius={7}  style={s.mb8} />
        <SkeletonBox width="70%" height={12} borderRadius={6}  style={s.mb6} />
        <SkeletonBox width="25%" height={11} borderRadius={5} />
      </View>
      <SkeletonBox width={48} height={26} borderRadius={6} />
    </View>
  );
};

// ─── Verse item skeleton ──────────────────────────────────────────────────────

export const VerseItemSkeleton: React.FC<{ odd?: boolean }> = ({ odd = false }) => {
  const { colors, isDarkMode } = useTheme();
  const bg = odd
    ? (isDarkMode ? colors.cardBackground + 'aa' : '#F9FAFB')
    : 'transparent';

  return (
    <View style={[s.verseItem, {
      backgroundColor:   bg,
      borderBottomColor: colors.borderLight,
    }]}>
      {/* Header row: number badge + audio btn */}
      <View style={s.verseHeader}>
        <SkeletonBox width={32} height={32} borderRadius={16} />
        <SkeletonBox width={32} height={32} borderRadius={16} />
      </View>

      {/* Arabic text (right-aligned) */}
      <View style={s.arabicBlock}>
        <SkeletonBox width="100%" height={30} borderRadius={8}  style={s.mb8} />
        <SkeletonBox width="82%"  height={30} borderRadius={8}  style={{ alignSelf: 'flex-end', marginBottom: 8 }} />
        <SkeletonBox width="55%"  height={30} borderRadius={8}  style={{ alignSelf: 'flex-end' }} />
      </View>

      {/* Translation */}
      <View style={s.transBlock}>
        <SkeletonBox width="92%" height={13} borderRadius={6} style={s.mb6} />
        <SkeletonBox width="70%" height={13} borderRadius={6} />
      </View>
    </View>
  );
};

// ─── Bismillah skeleton (first verse) ────────────────────────────────────────

export const BismillahSkeleton: React.FC = () => (
  <View style={s.bismillah}>
    <SkeletonBox width={260} height={34} borderRadius={10} />
  </View>
);

// ─── Surah header skeleton (for SurahDetail loading) ─────────────────────────

export const SurahHeaderSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  const bg = isDarkMode ? '#2D3748' : '#DDE3F0';

  return (
    <View style={[s.surahHeader, { backgroundColor: bg }]}>
      <SkeletonBox width={80}  height={11} borderRadius={5} style={s.mb12} />
      <SkeletonBox width={200} height={32} borderRadius={10} style={s.mb10} />
      <SkeletonBox width={160} height={22} borderRadius={8} style={s.mb8}  />
      <SkeletonBox width={220} height={14} borderRadius={6} style={s.mb18} />
      <SkeletonBox width={130} height={36} borderRadius={18} />
    </View>
  );
};

// ─── Section header skeleton (for list header) ───────────────────────────────

export const SectionHeaderSkeleton: React.FC = () => (
  <View style={s.sectionHeader}>
    <SkeletonBox width={130} height={20} borderRadius={8} />
    <SkeletonBox width={80}  height={14} borderRadius={6} />
  </View>
);

// ─── Search bar skeleton ──────────────────────────────────────────────────────

export const SearchBarSkeleton: React.FC = () => (
  <View style={s.searchBar}>
    <SkeletonBox height={48} borderRadius={14} />
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  flex1:  { flex: 1 },
  mb6:    { marginBottom: 6 },
  mb8:    { marginBottom: 8 },
  mb10:   { marginBottom: 10 },
  mb12:   { marginBottom: 12 },
  mb18:   { marginBottom: 18 },
  mr14:   { marginRight: 14 },

  lastRead: {
    flexDirection:     'row',
    alignItems:        'center',
    borderRadius:      16,
    padding:           20,
    marginVertical:    8,
    minHeight:         110,
  },
  lastReadLeft:  { flex: 1 },
  lastReadRight: { marginLeft: 16 },

  surahItem: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   14,
    paddingHorizontal: 16,
    marginVertical:    5,
    borderRadius:      14,
    borderWidth:       1,
  },

  verseItem: {
    paddingHorizontal: 16,
    paddingVertical:   20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  verseHeader:  {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   14,
  },
  arabicBlock:  { marginBottom: 14 },
  transBlock:   {},

  bismillah: {
    alignItems:   'center',
    paddingTop:   24,
    paddingBottom: 12,
  },

  surahHeader: {
    alignItems:        'center',
    paddingTop:        40,
    paddingBottom:     28,
    paddingHorizontal: 24,
  },

  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginTop:      20,
    marginBottom:   8,
  },

  searchBar: {
    paddingHorizontal: 16,
    paddingTop:        12,
    paddingBottom:     4,
  },
});
