// ═══════════════════════════════════════════════════════
// Karigar AI — Service Grid Component
// ═══════════════════════════════════════════════════════

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/layout';

const CATEGORIES = [
  { id: 'electrician', label: 'Electrician', emoji: '⚡', query: 'Bijli ka kaam karwana hai' },
  { id: 'plumber', label: 'Plumber', emoji: '🔧', query: 'Pani leak ho raha hai' },
  { id: 'ac_repair', label: 'AC Repair', emoji: '❄️', query: 'AC thanda nahi kar raha' },
  { id: 'tutor', label: 'Tutor', emoji: '📚', query: 'Maths teacher chahiye bache ke liye' },
  { id: 'beautician', label: 'Beautician', emoji: '💅', query: 'Salon at home package' },
  { id: 'more', label: 'More Services', emoji: '🏠', query: 'Karigar details' },
];

function GridItem({ category, onPress }) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1.0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.itemWrapper, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(category)}
        style={styles.card}
      >
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{category.emoji}</Text>
        </View>
        <Text style={styles.label}>{category.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ServiceGrid({ onCategoryPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>What do you need help with?</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((item) => (
          <GridItem
            key={item.id}
            category={item}
            onPress={onCategoryPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.md,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemWrapper: {
    width: '48%',
    aspectRatio: 1.3,
    marginBottom: SPACING.md,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(2, 195, 154, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
