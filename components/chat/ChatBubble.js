// ═══════════════════════════════════════════════════════
// Karigar AI — Chat Bubble Component
// ═══════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/layout';

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userRow : styles.aiRow]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isUser ? styles.userTime : styles.aiTime]}>
          {message.time || 'Abhi'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: SPACING.xs,
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: RADIUS.md,
    borderTopRightRadius: RADIUS.md,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.md,
    borderTopRightRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: COLORS.bg,
    fontWeight: '500',
  },
  aiText: {
    color: COLORS.textPrimary,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTime: {
    color: 'rgba(10, 15, 30, 0.6)',
  },
  aiTime: {
    color: COLORS.textMuted,
  },
});
