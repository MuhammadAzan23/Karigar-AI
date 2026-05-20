// ═══════════════════════════════════════════════════════
// Karigar AI — Tracking Timeline Component
// ═══════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/layout';

const PHASES = [
  { key: 'requested', title: 'Request Confirmed', desc: 'Booking saved successfully', urdu: 'Booking pakki ho gayi hai' },
  { key: 'accepted', title: 'Karigar Assigned', desc: 'Expert is assigned to your task', urdu: 'Karigar chun liya gaya hai' },
  { key: 'en_route', title: 'En Route', desc: 'Karigar is traveling to your home', urdu: 'Karigar raste mein hai' },
  { key: 'arrived', title: 'Arrived', desc: 'Karigar reached your location', urdu: 'Karigar pohnch gaya hai' },
  { key: 'completed', title: 'Work Completed', desc: 'Job finished successfully', urdu: 'Kaam poora ho gaya hai' },
];

export default function TrackingTimeline({ currentStatus = 'requested' }) {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Pulse animation loop for active status indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getStatusIndex = (status) => {
    const idx = PHASES.findIndex((p) => p.key === status);
    return idx !== -1 ? idx : 0;
  };

  const currentIndex = getStatusIndex(currentStatus);

  return (
    <View style={styles.container}>
      {PHASES.map((phase, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;
        const isPending = idx > currentIndex;

        return (
          <View key={phase.key} style={styles.stepRow}>
            {/* Left line & indicator */}
            <View style={styles.indicatorCol}>
              {isActive ? (
                <Animated.View
                  style={[
                    styles.indicatorRing,
                    { opacity: pulseAnim, transform: [{ scale: pulseAnim }] },
                  ]}
                />
              ) : null}

              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isActive && styles.dotActive,
                  isPending && styles.dotPending,
                ]}
              >
                {isCompleted && <Text style={styles.check}>✓</Text>}
              </View>

              {idx < PHASES.length - 1 && (
                <View
                  style={[
                    styles.line,
                    idx < currentIndex ? styles.lineCompleted : styles.linePending,
                  ]}
                />
              )}
            </View>

            {/* Right text details */}
            <View style={styles.contentCol}>
              <Text
                style={[
                  styles.title,
                  isActive && styles.titleActive,
                  isPending && styles.titlePending,
                ]}
              >
                {phase.title}
              </Text>
              <Text style={styles.urduText}>{phase.urdu}</Text>
              <Text style={styles.desc}>{phase.desc}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
    width: '100%',
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 70,
  },
  indicatorCol: {
    width: 32,
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 2,
  },
  dotCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dotActive: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.primary,
  },
  dotPending: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
  },
  check: {
    color: COLORS.bg,
    fontSize: 11,
    fontWeight: '900',
  },
  indicatorRing: {
    position: 'absolute',
    top: 0,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(2, 195, 154, 0.3)',
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    top: 20,
    bottom: 0,
    width: 2,
    zIndex: 0,
  },
  lineCompleted: {
    backgroundColor: COLORS.primary,
  },
  linePending: {
    backgroundColor: COLORS.border,
  },
  contentCol: {
    flex: 1,
    marginLeft: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  titleActive: {
    color: COLORS.primary,
  },
  titlePending: {
    color: COLORS.textMuted,
  },
  urduText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  desc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
