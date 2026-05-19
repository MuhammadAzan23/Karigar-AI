export const C = {
  // Backgrounds
  bg:         '#0B1622',
  bgDeep:     '#060E17',
  bgMid:      '#0F1E2E',

  // Glass surfaces (NEVER use solid cards — always glass)
  glass:      'rgba(255, 255, 255, 0.06)',
  glassMid:   'rgba(255, 255, 255, 0.10)',
  glassHigh:  'rgba(255, 255, 255, 0.15)',
  glassBorder:'rgba(255, 255, 255, 0.12)',

  // Brand
  primary:    '#02C39A',
  primaryDim: 'rgba(2, 195, 154, 0.15)',
  primaryGlow:'rgba(2, 195, 154, 0.35)',
  teal:       '#028090',
  tealDim:    'rgba(2, 128, 144, 0.20)',

  // State colors
  warning:    '#F9C74F',
  warningDim: 'rgba(249, 199, 79, 0.15)',
  danger:     '#E63946',
  dangerDim:  'rgba(230, 57, 70, 0.15)',
  success:    '#06D6A0',

  // Text
  white:      '#FFFFFF',
  textPrimary:'#F0F6FF',
  textSecond: '#8FB3C5',
  textMuted:  '#4A6880',
  textHint:   '#2D4A60',

  // Utility
  border:     'rgba(30, 58, 95, 0.6)',
  divider:    'rgba(255,255,255,0.06)',
  shadow:     'rgba(0, 0, 0, 0.5)',
  overlay:    'rgba(11, 22, 34, 0.92)',
};

export const GLASS_STYLE = {
  backgroundColor: C.glass,
  borderWidth: 1,
  borderColor: C.glassBorder,
  borderRadius: 20,
  overflow: 'hidden',
};
