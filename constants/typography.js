// ═══════════════════════════════════════════════════════
// Karigar AI — Typography Design Tokens
// ═══════════════════════════════════════════════════════

import { COLORS } from './colors';

export const TYPOGRAPHY = {
  display: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  subhead: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  mono: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: COLORS.textSecondary,
  },
};
