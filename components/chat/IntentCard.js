// ═══════════════════════════════════════════════════════
// Karigar AI — Intent Card Component
// ═══════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/layout';
import Badge from '../ui/Badge';

export default function IntentCard({ intent, style = {} }) {
  if (!intent) return null;

  const {
    service_type = 'AC Repair',
    location = 'Karachi',
    preferred_time = 'Aaj',
    urgency = 'medium',
  } = intent;

  const getUrgencyBadgeVariant = (urg) => {
    const val = (urg || 'medium').toLowerCase();
    if (val === 'high') return 'danger';
    if (val === 'medium') return 'warning';
    return 'success';
  };

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 Request Extracted</Text>
        <Badge
          label={(urgency || 'medium').toUpperCase()}
          variant={getUrgencyBadgeVariant(urgency)}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.grid}>
        <View style={styles.cell}>
          <Text style={styles.label}>SERVICE</Text>
          <Text style={styles.value} numberOfLines={1}>{service_type}</Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.label}>LOCATION</Text>
          <Text style={styles.value} numberOfLines={1}>{location}</Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.label}>SCHEDULE</Text>
          <Text style={styles.value} numberOfLines={1}>{preferred_time}</Text>
        </View>

        <View style={styles.cell}>
          <Text style={styles.label}>CONFIDENCE</Text>
          <Text style={[styles.value, { color: COLORS.primary }]}>98% Match</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
