// ═══════════════════════════════════════════════════════
// Karigar AI — Card Reusable Component
// ═══════════════════════════════════════════════════════

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS } from '../../constants/layout';

export default function Card({
  children,
  style = {},
  onPress = null,
  variant = 'default', // 'default' | 'highlight'
}) {
  const containerStyle = [
    styles.card,
    variant === 'highlight' ? styles.highlightBorder : styles.defaultBorder,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={containerStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOWS.card,
  },
  defaultBorder: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  highlightBorder: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
});
