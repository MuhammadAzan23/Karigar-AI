// ═══════════════════════════════════════════════════════
// Karigar AI — Price Breakdown Component
// ═══════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/layout';

export default function PriceBreakdown({ quote, style = {} }) {
  if (!quote) return null;

  const {
    visiting_fee = 200,
    distance_fee = 150,
    urgency_fee = 0,
    surge_fee = 0,
    discount = 0,
    subtotal = 1000,
    total = 1350,
  } = quote;

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>Invoice Summary (Bill ki Tafseelat)</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Service Subtotal</Text>
        <Text style={styles.val}>PKR {subtotal}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Visiting Charges (Karachi Base)</Text>
        <Text style={styles.val}>PKR {visiting_fee}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Distance Premium</Text>
        <Text style={styles.val}>PKR {distance_fee}</Text>
      </View>

      {urgency_fee > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: COLORS.warning }]}>Urgent Dispatch Fee</Text>
          <Text style={[styles.val, { color: COLORS.warning }]}>PKR {urgency_fee}</Text>
        </View>
      )}

      {surge_fee > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: COLORS.danger }]}>High Demand Surge</Text>
          <Text style={[styles.val, { color: COLORS.danger }]}>PKR {surge_fee}</Text>
        </View>
      )}

      {discount > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: COLORS.primary }]}>Top-Rated Discount</Text>
          <Text style={[styles.val, { color: COLORS.primary }]}>-PKR {discount}</Text>
        </View>
      )}

      <View style={styles.dashedLine} />

      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total Payable</Text>
        <Text style={styles.totalVal}>PKR {total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    width: '100%',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  val: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  dashedLine: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 1,
    marginVertical: SPACING.md,
  },
  totalRow: {
    marginTop: 2,
  },
  totalLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  totalVal: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
});
