import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { C } from '../constants/colors';
import * as Haptics from 'expo-haptics';

export default function ServiceChip({ emoji, label, onPress, active }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.75}>
      <BlurView
        intensity={active ? 60 : 35}
        tint="dark"
        style={[styles.chip, active && styles.chipActive]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, active && styles.labelActive]}>
          {label}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, paddingHorizontal: 14,
    borderRadius: 50, borderWidth: 1,
    borderColor: C.glassBorder, marginRight: 8,
    backgroundColor: C.glass,
  },
  chipActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryDim,
  },
  emoji: { fontSize: 14, marginRight: 6 },
  label: { fontSize: 13, fontWeight: '600', color: C.textSecond },
  labelActive: { color: C.primary },
});
