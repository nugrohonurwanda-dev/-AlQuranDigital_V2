// utils/tajweedColors.ts

export type TajweedColorKey =
  | 'merah' | 'magenta' | 'cyan' | 'hijau' | 'biru' | 'abu_abu' | 'default';

export const BaseTajweedColors: Record<TajweedColorKey, string> = {
  merah:   '#D32F2F',
  magenta: '#9C27B0',
  cyan:    '#00BCD4',
  hijau:   '#4CAF50',
  biru:    '#2196F3',
  abu_abu: '#757575',
  default: '#212121',
};

interface TajweedPatternItem {
  color: string;
  patterns: string[];
}

const TajweedPatterns: Record<string, TajweedPatternItem> = {
  // 🔴 MERAH
  idgham_bilaghunnah:  { color: BaseTajweedColors.merah,   patterns: ['idgam-bilaghunah', 'idgam_bilaghunnah', 'idgham_bilaghunnah', 'idgam'] },
  idgham_mutajanisain: { color: BaseTajweedColors.merah,   patterns: ['idgham_mutajanisain', 'mutajanisain'] },
  idgham_mutaqaribain: { color: BaseTajweedColors.merah,   patterns: ['idgham_mutaqaribain', 'mutaqaribain'] },
  waqaf_lazim:         { color: BaseTajweedColors.merah,   patterns: ['waqaf_lazim', 'waqf_lazim', 'waqaf-lazim'] },
  al_waqfu_aula:       { color: BaseTajweedColors.merah,   patterns: ['al_waqfu_aula', 'waqfu_aula', 'waqaf_aula'] },
  lam_syamsiyah:       { color: BaseTajweedColors.merah,   patterns: ['laam_shamsiyah', 'lam_syamsiyah'] },

  // 🟣 MAGENTA
  idgham_bighunnah: { color: BaseTajweedColors.magenta, patterns: ['idgam_bighunah', 'idgham_bighunnah', 'idgam-bighunnah'] },
  idgham_mimi:      { color: BaseTajweedColors.magenta, patterns: ['idgham_mimi', 'mimi'] },
  ghunnah:          { color: BaseTajweedColors.magenta, patterns: ['ghunnah', 'dengung'] },
  mad_lazim:        { color: BaseTajweedColors.magenta, patterns: ['mad_lazim', 'madda_necessary', 'mad-lazim'] },

  // 🔵 CYAN
  iqlab:               { color: BaseTajweedColors.cyan, patterns: ['iqlab'] },
  mad_wajib_muttashil: { color: BaseTajweedColors.cyan, patterns: ['mad_wajib_muttashil', 'mad_muttashil', 'mad-wajib-muttashil'] },

  // 🟢 HIJAU
  ikhfa:              { color: BaseTajweedColors.hijau, patterns: ['ikhfa', 'ikhfa_haqiqi'] },
  ikhfa_syafawi:      { color: BaseTajweedColors.hijau, patterns: ['ikhfa_syafawi', 'ikhfa-syafawi'] },
  mad_jaiz_munfashil: { color: BaseTajweedColors.hijau, patterns: ['mad_jaiz_munfashil', 'mad_munfashil', 'mad-jaiz-munfashil', 'madda_permissible'] },
  mad_silah_thawilah: { color: BaseTajweedColors.hijau, patterns: ['mad_silah_thawilah', 'silah_thawilah', 'mad-silah-thawilah'] },
  mad_umum:           { color: BaseTajweedColors.hijau, patterns: ['mad', 'madda_normal', 'madd'] },
  al_washlu_aula:     { color: BaseTajweedColors.hijau, patterns: ['al_washlu_aula', 'washlu_aula', 'washl_aula'] },
  la_waqfa_fih:       { color: BaseTajweedColors.hijau, patterns: ['la_waqfa_fih', 'la_waqaf', 'la-waqfa-fih'] },

  // 🔵 BIRU
  qalqalah:       { color: BaseTajweedColors.biru, patterns: ['qalqalah'] },
  waqaf_muanaqah: { color: BaseTajweedColors.biru, patterns: ['waqaf_muanaqah', 'muanaqah', 'waqaf-muanaqah'] },
  waqaf_jaiz:     { color: BaseTajweedColors.biru, patterns: ['waqaf_jaiz', 'waqf_jaiz', 'waqaf-jaiz', 'waqaf'] },

  // ⚫ ABU-ABU
  huruf_tidak_dilafalkan: { color: BaseTajweedColors.abu_abu, patterns: ['tidak_dilafalkan', 'silent', 'muted', 'k30'] },
  akhir_ayat:             { color: BaseTajweedColors.abu_abu, patterns: ['akhir-ayat', 'akhir_ayat', 'end_verse'] },

  // DEFAULT
  hamzah_wasal:  { color: BaseTajweedColors.default, patterns: ['ham_wasl', 'hamzah-wasal', 'hamzah_wasal'] },
  lam_qamariyah: { color: BaseTajweedColors.default, patterns: ['laam_qamariyah', 'lam_qamariyah'] },
};

// Generate mapping dari pattern string ke warna hex
export const TajweedColors: Record<string, string> = (() => {
  const colors: Record<string, string> = {};
  Object.values(TajweedPatterns).forEach(({ color, patterns }) => {
    patterns.forEach(pattern => { colors[pattern] = color; });
  });
  colors['default'] = BaseTajweedColors.default;
  return colors;
})();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TajweedSegment {
  text: string;
  style: { color: string } | null;
  className: string | null;
}

export interface TajweedInfo {
  rule: string;
  color: string;
  className: string;
}

// ─── Helper functions ─────────────────────────────────────────────────────────

export const getTajweedColor = (className: string): { color: string } | null => {
  if (!className) return null;

  const clean = className.replace(/^[\"']|[\"']$/g, '').trim();

  const tryLookup = (key: string) => TajweedColors[key] ?? null;

  return (
    tryLookup(clean) ??
    tryLookup(clean.toLowerCase()) ??
    tryLookup(clean.replace(/_/g, '-')) ??
    tryLookup(clean.replace(/-/g, '_')) ??
    tryLookup(clean.toLowerCase().replace(/_/g, '-')) ??
    tryLookup(clean.toLowerCase().replace(/-/g, '_'))
  )
    ? { color: TajweedColors[
        [clean, clean.toLowerCase(), clean.replace(/_/g,'-'), clean.replace(/-/g,'_'),
         clean.toLowerCase().replace(/_/g,'-'), clean.toLowerCase().replace(/-/g,'_')]
          .find(v => TajweedColors[v])!
      ] }
    : null;
};

export const parseTajweedToNativeSegments = (htmlText: string): TajweedSegment[] => {
  if (!htmlText || typeof htmlText !== 'string') {
    return [{ text: htmlText || '', style: null, className: null }];
  }

  const segments: TajweedSegment[] = [];
  let currentIndex = 0;
  const tagRegex = /<(\w+)(?:\s+([^>]*?))?>(.*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(htmlText)) !== null) {
    const [fullMatch, , attributes, content] = match;
    const startIndex = match.index;

    if (startIndex > currentIndex) {
      const beforeText = htmlText.slice(currentIndex, startIndex).replace(/<[^>]*>/g, '').trim();
      if (beforeText) segments.push({ text: beforeText, style: null, className: null });
    }

    let className: string | null = null;
    if (attributes) {
      const classMatch = attributes.match(/class\s*=\s*([^\s>]+|"[^"]*"|'[^']*')/i);
      if (classMatch) className = classMatch[1].replace(/^[\"']|[\"']$/g, '').trim();
    }

    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    if (cleanContent) {
      segments.push({
        text: cleanContent,
        style: className ? getTajweedColor(className) : null,
        className,
      });
    }

    currentIndex = startIndex + fullMatch.length;
  }

  if (currentIndex < htmlText.length) {
    const remaining = htmlText.slice(currentIndex).replace(/<[^>]*>/g, '').trim();
    if (remaining) segments.push({ text: remaining, style: null, className: null });
  }

  if (segments.length === 0) {
    return [{ text: htmlText.replace(/<[^>]*>/g, ''), style: null, className: null }];
  }

  return segments;
};

export const getTajweedInfo = (className: string): TajweedInfo | null => {
  if (!className) return null;
  const clean = className.replace(/^[\"']|[\"']$/g, '').trim().toLowerCase();

  for (const [ruleName, { color, patterns }] of Object.entries(TajweedPatterns)) {
    const match = patterns.some(p =>
      [p.toLowerCase(), p.toLowerCase().replace(/_/g,'-'), p.toLowerCase().replace(/-/g,'_')]
        .includes(clean)
    );
    if (match) return { rule: ruleName, color, className };
  }
  return null;
};

export { BaseTajweedColors as TajweedBaseColors, TajweedColors as TajweedColorMap };
export default TajweedColors;
