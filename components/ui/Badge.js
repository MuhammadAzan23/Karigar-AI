// ═══════════════════════════════════════════════════════
// Karigar AI — Badge Reusable Component
// ═══════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/layout';

export default function Badge({
  text,
  variant = 'default', // 'success' | 'warning' | 'danger' | 'info' | 'default'
  style = {},
  textStyle = {},
}) {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'success':
        return styles.success;
      case 'warning':
        return styles.warning;
      case 'danger':
        return styles.danger;
      case 'info':
        return styles.info;
      case 'default':
      default:
        return styles.default;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'success':
        return styles.textSuccess;
      case 'warning':
        return styles.textWarning;
      case 'danger':
        return styles.textDanger;
      case 'info':
        return styles.textInfo;
      case 'default':
      default:
        return styles.textDefault;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={[styles.text, getTextStyle(), textStyle]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  info: {
    backgroundColor: 'rgba(2, 195, 154, 0.15)',
  },
  default: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSuccess: {
    color: COLORS.success,
  },
  textWarning: {
    color: COLORS.warning,
  },
  textDanger: {
    color: COLORS.danger,
  },
  textInfo: {
    color: COLORS.primary,
  },
  textDefault: {
    color: COLORS.textSecondary,
  },
});
