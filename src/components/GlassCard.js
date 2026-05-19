import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { C } from '../constants/colors';

/*
  GlassCard — the core surface component.
  ALL cards in the app use this. Never use a plain View as a card.

  Props:
    intensity  — blur intensity 20–80 (default 40)
    style      — additional styles
    children
    noBorder   — remove border
    tint       — 'dark' (default) | 'light'
*/
export default function GlassCard({
  intensity = 40,
  style,
  children,
  noBorder = false,
  tint = 'dark',
}) {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[styles.base, !noBorder && styles.border, style]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: C.glass,
  },
  border: {
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
});
