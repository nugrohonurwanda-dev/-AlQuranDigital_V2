# Al-Qur'an Digital 📖

Aplikasi Al-Qur'an Digital berbasis **React Native + Expo** dengan fitur tajweed berwarna, audio murottal, dan panduan ilmu tajwid.

## ✨ Fitur Utama

- **Al-Qur'an lengkap** 114 surah dengan teks Arab berharakat
- **Tajweed berwarna** — sistem 6 warna untuk memvisualisasikan hukum bacaan
- **Audio murottal** dari 5 qari pilihan via Equran.id
- **Terjemahan** Bahasa Indonesia (Kemenag)
- **Dark mode** dengan tema otomatis
- **Font Arab kustom** — Amiri, Lateef, Scheherazade New
- **Panduan tajwid** interaktif dengan contoh dan penjelasan

## 🛠 Tech Stack

| Layer      | Teknologi                                |
| ---------- | ---------------------------------------- |
| Framework  | React Native 0.79 + Expo SDK 54          |
| Language   | TypeScript (strict mode)                 |
| Navigation | React Navigation v7 (Stack + BottomTabs) |
| Audio      | expo-audio                               |
| Storage    | AsyncStorage                             |
| Build      | EAS Build (Expo Application Services)    |

## 📁 Struktur Proyek

```
src/
├── components/     # UI components (VerseItem, CompactMusicPlayer, dll)
├── contexts/       # React Context (Theme, Font, Audio)
├── navigation/     # Stack & Tab navigators
├── screens/        # App screens
├── services/       # API layer (quran.com v4 + equran.id v2)
├── types/          # TypeScript type definitions
└── utils/          # Helpers (tajweedColors, translationCleaner)
```

## 🚀 Menjalankan Aplikasi

### Prasyarat

- Node.js 18+
- Bun atau npm
- Expo Go (App Store) untuk development

### Instalasi

```bash
# Clone repository
git clone https://github.com/username/alquran-digital.git
cd alquran-digital

# Install dependencies
bun install

# Jalankan development server
bunx expo start
```

### Build APK (via EAS)

```bash
# Login ke Expo
bunx eas login

# Build APK untuk testing
bunx eas build --platform android --profile preview

# Build untuk production
bunx eas build --platform android --profile production
```

## 🎨 Sistem Warna Tajweed

| Warna      | Hukum Bacaan                         |
| ---------- | ------------------------------------ |
| 🔴 Merah   | Idgham Bilaghunnah, Waqaf Lazim      |
| 🟣 Magenta | Idgham Bighunnah, Ghunnah, Mad Lazim |
| 🔵 Cyan    | Iqlab, Mad Wajib Muttashil           |
| 🟢 Hijau   | Ikhfa, Mad Jaiz Munfashil            |
| 💙 Biru    | Qalqalah, Waqaf Jaiz                 |
| ⚫ Abu-abu | Huruf tidak dilafalkan               |

## 📡 Sumber Data

- **Al-Qur'an & Terjemahan**: [Quran.com API v4](https://quran.com/en/about/resources)
- **Audio Murottal**: [Equran.id API v2](https://equran.id)

## 📄 Lisensi

MIT License — bebas digunakan untuk keperluan edukasi dan non-komersial.

---
