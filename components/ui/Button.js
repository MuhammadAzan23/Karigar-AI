// ═══════════════════════════════════════════════════════
// Karigar AI — Button Reusable Component
// ═══════════════════════════════════════════════════════

import React, { useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/layout';

export default function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  loading = false,
  disabled = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = true,
  icon = null,
  style = {},
}) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scaleValue, {
      toValue: 1.0,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return [styles.btn, styles.primary, disabled && styles.disabled];
      case 'secondary':
        return [styles.btn, styles.secondary, disabled && styles.disabled];
      case 'danger':
        return [styles.btn, styles.danger, disabled && styles.disabled];
      case 'ghost':
        return [styles.btn, styles.ghost, disabled && styles.disabled];
      default:
        return [styles.btn, styles.primary];
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return styles.textPrimary;
      case 'secondary':
        return styles.textSecondary;
      case 'danger':
        return styles.textDanger;
      case 'ghost':
        return styles.textGhost;
      default:
        return styles.textPrimary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return styles.sm;
      case 'lg':
        return styles.lg;
      case 'md':
      default:
        return styles.md;
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }], width: fullWidth ? '100%' : 'auto' }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        style={[getButtonStyles(), getSizeStyles(), style]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? COLORS.bg : COLORS.white} size="small" />
        ) : (
          <>
            {icon && <Text style={[getTextStyles(), styles.iconStyle]}>{icon}</Text>}
            <Text style={[getTextStyles(), size === 'sm' && styles.textSm]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.teal,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
  },
  disabled: {
    opacity: 0.5,
  },
  md: {
    height: 52,
  },
  sm: {
    height: 38,
    paddingHorizontal: 12,
  },
  lg: {
    height: 60,
  },
  textPrimary: {
    color: COLORS.bg,
    fontSize: 15,
    fontWeight: '700',
  },
  textSecondary: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  textDanger: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  textGhost: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 13,
  },
  iconStyle: {
    marginRight: 8,
  },
});
