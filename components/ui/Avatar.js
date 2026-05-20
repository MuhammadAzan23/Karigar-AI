// ═══════════════════════════════════════════════════════
// Karigar AI — Avatar Reusable Component
// ═══════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/layout';

export default function Avatar({
  initials,
  size = 44,
  bg = COLORS.teal,
  border = false,
  style = {},
  textStyle = {},
}) {
  const fontSize = size * 0.4;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
        border && styles.withBorder,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: fontSize,
            lineHeight: fontSize * 1.2,
          },
          textStyle,
        ]}
      >
        {initials || 'K'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  withBorder: {
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  text: {
    color: COLORS.white,
    fontWeight: '700',
    textAlign: 'center',
  },
});
