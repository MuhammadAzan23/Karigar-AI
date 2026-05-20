// ═══════════════════════════════════════════════════════
// Karigar AI — Karigar Card Component
// ═══════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS } from '../../constants/layout';
import Avatar from '../ui/Avatar';

export default function KarigarCard({
  provider,
  onBookPress,
  onCardPress,
  width = 200,
  style = {},
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onCardPress}
      style={[styles.card, { width }, style]}
    >
      {/* Top Accent Strip */}
      <View style={[styles.accentStrip, { backgroundColor: provider.avatar_bg || COLORS.teal }]} />

      {/* Content Container */}
      <View style={styles.content}>
        {/* Row: Avatar + Name / Service */}
        <View style={styles.headerRow}>
          <Avatar
            initials={provider.initials || provider.name?.substring(0, 2)}
            size={36}
            bg={provider.avatar_bg || COLORS.teal}
          />
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>
              {provider.name}
            </Text>
            <Text style={styles.service} numberOfLines={1}>
              {provider.service_type}
            </Text>
          </View>
        </View>

        {/* Row: Rating + Jobs */}
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>
            ⭐ <Text style={styles.ratingVal}>{provider.rating.toFixed(1)}</Text>
          </Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.jobs}>{provider.review_count || 10} jobs</Text>
        </View>

        {/* Row: Distance + Price */}
        <View style={styles.detailsRow}>
          <Text style={styles.distance}>
            📍 {provider.distanceKm !== undefined ? `${provider.distanceKm} km` : provider.area || 'Karachi'}
          </Text>
          <Text style={styles.price}>
            PKR {provider.price_per_hour}/hr
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBookPress}
          style={styles.bookBtn}
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  accentStrip: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  service: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  rating: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  ratingVal: {
    color: COLORS.textSecondary,
  },
  dot: {
    color: COLORS.textMuted,
    marginHorizontal: 6,
    fontSize: 12,
  },
  jobs: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  distance: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  price: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    height: 36,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  bookBtnText: {
    color: COLORS.bg,
    fontSize: 13,
    fontWeight: '700',
  },
});
