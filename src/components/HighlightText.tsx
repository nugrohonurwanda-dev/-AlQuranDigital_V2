// components/HighlightText.tsx
import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  text:       string;
  highlight:  string;
  style?:     TextStyle;
  highlightStyle?: TextStyle;
}

/**
 * Renders `text` with every occurrence of `highlight` wrapped in
 * a highlighted <Text> span (case-insensitive).
 */
export default function HighlightText({ text, highlight, style, highlightStyle }: Props) {
  const { colors } = useTheme();

  if (!highlight.trim()) {
    return <Text style={style}>{text}</Text>;
  }

  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex   = new RegExp(`(${escaped})`, 'gi');
  const parts   = text.split(regex);

  return (
    <Text style={style}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <Text
            key={i}
            style={[
              {
                backgroundColor: colors.primary + '30',
                color:           colors.primary,
                fontWeight:      '700',
                borderRadius:    3,
              },
              highlightStyle,
            ]}
          >
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        ),
      )}
    </Text>
  );
}
