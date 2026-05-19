import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';
import * as Haptics from 'expo-haptics';

/*
  KarigarCard — used in MapScreen list AND search results.
  Props:
    karigar     — full karigar object from mockData
    onPress     — navigate to profile or start booking
    compact     — smaller version for map bottom sheet
    rank        — show rank badge (1, 2, 3 = top match)
*/
export default function KarigarCard({
  karigar, onPress, compact = false, rank,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scale, {
      toValue: 0.97, useNativeDriver: true,
      speed: 50, bounciness: 4,
    }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1, useNativeDriver: true,
      speed: 20, bounciness: 6,
    }).start();
    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <BlurView
        intensity={45} tint="dark"
        style={[styles.card, compact && styles.compact]}
      >
        {/* Rank badge */}
        {rank === 1 && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>🏆 BEST MATCH</Text>
          </View>
        )}

        <TouchableOpacity
          onPressIn={pressIn}
          onPressOut={pressOut}
          activeOpacity={1}
          style={styles.inner}
        >
          {/* Avatar */}
          <View style={[styles.avatar,
            { backgroundColor: karigar.avatarColor }]}>
            <Text style={styles.avatarText}>{karigar.initials}</Text>
            {karigar.available && <View style={styles.onlineDot} />}
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.name}>{karigar.name}</Text>
            <Text style={styles.service}>{karigar.service}</Text>
            {!compact && (
              <Text style={styles.bio} numberOfLines={1}>
                {karigar.bio}
              </Text>
            )}
            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>⭐ {karigar.rating}</Text>
              <View style={styles.dot} />
              <Text style={styles.metaItem}>
                📍 {karigar.distance}km
              </Text>
              <View style={styles.dot} />
              <Text style={styles.metaItem}>✅ {karigar.onTime}%</Text>
            </View>
          </View>

          {/* Price & Action */}
          <View style={styles.priceCol}>
            <Text style={styles.price}>PKR {karigar.price}</Text>
            <Text style={styles.priceLabel}>/ghanta</Text>
            <View style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>Book</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Subtle score bar at bottom */}
        <View style={styles.scoreBar}>
          <LinearGradient
            colors={[C.primary, C.teal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.scoreFill,
              { width: `${(karigar.rating / 5) * 100}%` }]}
          />
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20, borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    marginBottom: 12, overflow: 'hidden',
  },
  compact: { borderRadius: 16 },
  inner: {
    flexDirection: 'row', padding: 16,
    alignItems: 'flex-start',
  },
  rankBadge: {
    backgroundColor: C.primaryDim, paddingVertical: 6,
    paddingHorizontal: 14, borderBottomWidth: 1,
    borderColor: C.primaryGlow,
  },
  rankText: {
    fontSize: 10, fontWeight: '700',
    color: C.primary, letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14, position: 'relative',
  },
  avatarText: {
    fontSize: 18, fontWeight: '800', color: '#fff',
  },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: C.primary,
    borderWidth: 2, borderColor: C.bgDeep,
  },
  info: { flex: 1, marginRight: 10 },
  name: {
    fontSize: 16, fontWeight: '700',
    color: C.textPrimary, marginBottom: 2,
  },
  service: { fontSize: 12, color: C.primary, marginBottom: 4 },
  bio: { fontSize: 12, color: C.textSecond, marginBottom: 6 },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
  },
  metaItem: { fontSize: 11, color: C.textSecond },
  dot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: C.textMuted, marginHorizontal: 6,
  },
  priceCol: { alignItems: 'flex-end', justifyContent: 'space-between' },
  price: { fontSize: 15, fontWeight: '700', color: C.primary },
  priceLabel: { fontSize: 10, color: C.textMuted, marginBottom: 8 },
  bookBtn: {
    backgroundColor: C.primary, borderRadius: 10,
    paddingVertical: 7, paddingHorizontal: 14,
  },
  bookBtnText: { fontSize: 12, fontWeight: '700', color: C.bgDeep },
  scoreBar: {
    height: 2, backgroundColor: C.glassHigh,
    marginHorizontal: 16, marginBottom: 16, borderRadius: 1,
  },
  scoreFill: { height: '100%', borderRadius: 1 },
});
