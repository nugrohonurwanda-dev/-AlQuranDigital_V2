// screens/JuzListScreen.tsx
import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ListRenderItemInfo,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { JuzStackParamList } from '../types/navigation';

type Props = { navigation: StackNavigationProp<JuzStackParamList, 'JuzList'> };

interface JuzInfo {
  id:          number;
  startSurah:  string;
  endSurah:    string;
  arabicName:  string;
  versesCount: number;
}

// Hardcoded: data 30 Juz stabil, tidak perlu network request di halaman list
const JUZ_DATA: JuzInfo[] = [
  { id: 1,  startSurah: 'Al-Fatihah 1:1',    endSurah: 'Al-Baqarah 2:141',   arabicName: 'الم',                  versesCount: 148 },
  { id: 2,  startSurah: 'Al-Baqarah 2:142',  endSurah: 'Al-Baqarah 2:252',   arabicName: 'سَيَقُولُ',            versesCount: 111 },
  { id: 3,  startSurah: 'Al-Baqarah 2:253',  endSurah: 'Ali Imran 3:91',      arabicName: 'تِلْكَ',               versesCount: 130 },
  { id: 4,  startSurah: 'Ali Imran 3:92',    endSurah: 'An-Nisa 4:23',        arabicName: 'لَن تَنَالُوا',        versesCount: 130 },
  { id: 5,  startSurah: 'An-Nisa 4:24',      endSurah: 'An-Nisa 4:147',       arabicName: 'وَالْمُحْصَنَاتُ',    versesCount: 124 },
  { id: 6,  startSurah: 'An-Nisa 4:148',     endSurah: 'Al-Maidah 5:81',      arabicName: 'لَا يُحِبُّ',          versesCount: 110 },
  { id: 7,  startSurah: 'Al-Maidah 5:82',    endSurah: 'Al-Anam 6:110',       arabicName: 'وَلَوْ أَنَّنَا',      versesCount: 149 },
  { id: 8,  startSurah: 'Al-Anam 6:111',     endSurah: 'Al-Araf 7:87',        arabicName: 'وَلَوْ أَنَّنَا',      versesCount: 142 },
  { id: 9,  startSurah: 'Al-Araf 7:88',      endSurah: 'Al-Anfal 8:40',       arabicName: 'قَالَ الْمَلَأُ',     versesCount: 159 },
  { id: 10, startSurah: 'Al-Anfal 8:41',     endSurah: 'At-Tawbah 9:92',      arabicName: 'وَاعْلَمُوا',          versesCount: 127 },
  { id: 11, startSurah: 'At-Tawbah 9:93',    endSurah: 'Hud 11:5',            arabicName: 'يَعْتَذِرُونَ',        versesCount: 148 },
  { id: 12, startSurah: 'Hud 11:6',          endSurah: 'Yusuf 12:52',         arabicName: 'وَمَا مِنْ دَابَّةٍ', versesCount: 160 },
  { id: 13, startSurah: 'Yusuf 12:53',       endSurah: 'Ibrahim 14:52',        arabicName: 'وَمَا أُبَرِّئُ',     versesCount: 154 },
  { id: 14, startSurah: 'Al-Hijr 15:1',      endSurah: 'An-Nahl 16:128',      arabicName: 'رُبَمَا',              versesCount: 227 },
  { id: 15, startSurah: 'Al-Isra 17:1',      endSurah: 'Al-Kahf 18:74',       arabicName: 'سُبْحَانَ',            versesCount: 148 },
  { id: 16, startSurah: 'Al-Kahf 18:75',     endSurah: 'Ta-Ha 20:135',        arabicName: 'قَالَ أَلَمْ',         versesCount: 197 },
  { id: 17, startSurah: 'Al-Anbiya 21:1',    endSurah: 'Al-Hajj 22:78',       arabicName: 'اقْتَرَبَ',            versesCount: 190 },
  { id: 18, startSurah: 'Al-Muminun 23:1',   endSurah: 'Al-Furqan 25:20',     arabicName: 'قَدْ أَفْلَحَ',        versesCount: 202 },
  { id: 19, startSurah: 'Al-Furqan 25:21',   endSurah: 'An-Naml 27:55',       arabicName: 'وَقَالَ الَّذِينَ',   versesCount: 195 },
  { id: 20, startSurah: 'An-Naml 27:56',     endSurah: 'Al-Ankabut 29:45',    arabicName: 'أَمَّنْ',              versesCount: 171 },
  { id: 21, startSurah: 'Al-Ankabut 29:46',  endSurah: 'Al-Ahzab 33:30',      arabicName: 'اتْلُ مَا أُوحِيَ',  versesCount: 180 },
  { id: 22, startSurah: 'Al-Ahzab 33:31',    endSurah: 'Ya-Sin 36:27',        arabicName: 'وَمَنْ يَقْنُتْ',     versesCount: 169 },
  { id: 23, startSurah: 'Ya-Sin 36:28',      endSurah: 'Az-Zumar 39:31',      arabicName: 'وَمَا لِيَ',           versesCount: 357 },
  { id: 24, startSurah: 'Az-Zumar 39:32',    endSurah: 'Fussilat 41:46',      arabicName: 'فَمَنْ أَظْلَمُ',     versesCount: 346 },
  { id: 25, startSurah: 'Fussilat 41:47',    endSurah: 'Al-Jathiya 45:37',    arabicName: 'إِلَيْهِ يُرَدُّ',    versesCount: 246 },
  { id: 26, startSurah: 'Al-Ahqaf 46:1',     endSurah: 'Az-Zariyat 51:30',    arabicName: 'حم',                  versesCount: 336 },
  { id: 27, startSurah: 'Az-Zariyat 51:31',  endSurah: 'Al-Hadid 57:29',      arabicName: 'قَالَ فَمَا خَطْبُكُمْ', versesCount: 404 },
  { id: 28, startSurah: 'Al-Mujadila 58:1',  endSurah: 'At-Tahrim 66:12',     arabicName: 'قَدْ سَمِعَ',          versesCount: 137 },
  { id: 29, startSurah: 'Al-Mulk 67:1',      endSurah: 'Al-Mursalat 77:50',   arabicName: 'تَبَارَكَ',            versesCount: 431 },
  { id: 30, startSurah: 'An-Naba 78:1',      endSurah: 'An-Nas 114:6',        arabicName: 'عَمَّ',                versesCount: 564 },
];

export default function JuzListScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const renderItem = ({ item }: ListRenderItemInfo<JuzInfo>) => (
    <TouchableOpacity
      style={[styles.item, {
        backgroundColor: colors.cardBackground,
        borderColor:     colors.border,
      }]}
      onPress={() => navigation.navigate('JuzDetail', {
        juzNumber:  item.id,
        arabicName: item.arabicName,
        startSurah: item.startSurah,
        endSurah:   item.endSurah,
      })}
      activeOpacity={0.7}
    >
      {/* Badge */}
      <View style={[styles.badge, {
        backgroundColor: colors.primary + '18',
        borderColor:     colors.primary + '40',
      }]}>
        <Text style={[styles.badgeNum, { color: colors.primary }]}>{item.id}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.juzTitle, { color: colors.text }]}>Juz {item.id}</Text>
        <Text style={[styles.range, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.startSurah} — {item.endSurah}
        </Text>
        <Text style={[styles.count, { color: colors.textLight }]}>
          {item.versesCount} ayat
        </Text>
      </View>

      {/* Arabic name */}
      <View style={styles.rightCol}>
        <Text style={[styles.arabicName, { color: colors.primary, fontFamily: 'Amiri-Bold' }]}>
          {item.arabicName}
        </Text>
        <Text style={[styles.arabicLabel, { color: colors.textLight }]}>Pembuka</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={JUZ_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  listContent: { paddingVertical: 12, paddingHorizontal: 16 },
  item: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   14,
    paddingHorizontal: 16,
    marginBottom:      10,
    borderRadius:      14,
    borderWidth:       1,
    elevation:         2,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 1 },
    shadowOpacity:     0.06,
    shadowRadius:      4,
  },
  badge: {
    width:          44,
    height:         44,
    borderRadius:   22,
    borderWidth:    1.5,
    justifyContent: 'center',
    alignItems:     'center',
    marginRight:    14,
    flexShrink:     0,
  },
  badgeNum:    { fontSize: 15, fontWeight: '700' },
  info:        { flex: 1, paddingRight: 8 },
  juzTitle:    { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  range:       { fontSize: 12, marginBottom: 2 },
  count:       { fontSize: 11 },
  rightCol:    { alignItems: 'flex-end', flexShrink: 0 },
  arabicName:  { fontSize: 20, textAlign: 'right', marginBottom: 2 },
  arabicLabel: { fontSize: 10, textAlign: 'right' },
});
