// ═══════════════════════════════════════════════════════
// Karigar AI — Provider Map Pin Component
// ═══════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS } from '../../constants/layout';

export default function ProviderPin({ provider }) {
  const pinColor = provider.avatar_bg || COLORS.teal;
  const initials = provider.initials || provider.name?.substring(0, 2) || 'K';
  
  // Custom mapping of service types to emojis
  const getEmoji = (service) => {
    const s = (service || '').toLowerCase();
    if (s.includes('electrician')) return '⚡';
    if (s.includes('plumber')) return '🔧';
    if (s.includes('ac')) return '❄️';
    if (s.includes('tutor')) return '📚';
    if (s.includes('beautician') || s.includes('salon')) return '💅';
    return '🛠️';
  };

  return (
    <View style={styles.container}>
      {/* Outer Glow & Main Bubble */}
      <View style={[styles.bubble, { borderColor: pinColor }]}>
        <View style={[styles.avatar, { backgroundColor: pinColor }]}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
        <Text style={styles.emoji}>{getEmoji(provider.service_type)}</Text>
      </View>
      
      {/* Pointer triangle */}
      <View style={[styles.triangle, { borderTopColor: pinColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 50,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  initialsText: {
    color: COLORS.bg,
    fontSize: 9,
    fontWeight: '800',
  },
  emoji: {
    fontSize: 14,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
