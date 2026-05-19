import { Platform } from 'react-native';

const BASE = Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif';

export const T = {
  // Display — hero sections only
  display: {
    fontFamily: BASE,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 58,
    color: '#F0F6FF',
  },
  // Section headings
  h1: {
    fontFamily: BASE,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 38,
    color: '#F0F6FF',
  },
  h2: {
    fontFamily: BASE,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 28,
    color: '#F0F6FF',
  },
  h3: {
    fontFamily: BASE,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    color: '#F0F6FF',
  },
  // Labels — always uppercase
  label: {
    fontFamily: BASE,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    lineHeight: 14,
    color: '#028090',
    textTransform: 'uppercase',
  },
  // Body
  body: {
    fontFamily: BASE,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 23,
    color: '#8FB3C5',
  },
  bodyMed: {
    fontFamily: BASE,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 23,
    color: '#F0F6FF',
  },
  small: {
    fontFamily: BASE,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: '#8FB3C5',
  },
  smallBold: {
    fontFamily: BASE,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    color: '#F0F6FF',
  },
  // Tab labels
  tab: {
    fontFamily: BASE,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
};
