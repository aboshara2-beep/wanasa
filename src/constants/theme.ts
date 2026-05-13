// ===================================
// 🎨 Wanasa Design System
// ===================================

export const Colors = {
  // Brand
  primary:        '#FF6B2C',
  primaryLight:   '#FF8C5A',
  primaryDark:    '#E5561F',

  // Background
  background:     '#0F0F0F',
  surface:        '#1A1A1A',
  surfaceElevated:'#242424',
  card:           '#1E1E1E',

  // Text
  textPrimary:    '#FFFFFF',
  textSecondary:  '#A0A0A0',
  textMuted:      '#606060',
  textOnPrimary:  '#FFFFFF',

  // Semantic
  success:        '#22C55E',
  warning:        '#F59E0B',
  error:          '#EF4444',
  info:           '#3B82F6',

  // Borders
  border:         '#2A2A2A',
  borderLight:    '#333333',

  // Overlay
  overlay:        'rgba(0,0,0,0.6)',
  overlayLight:   'rgba(0,0,0,0.3)',

  // Special
  gold:           '#FFD700',
  silver:         '#C0C0C0',
  bronze:         '#CD7F32',
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
} as const;

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

export const Typography = {
  sizes: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   24,
    xxl:  30,
    xxxl: 36,
  },
  weights: {
    regular:   '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
  },
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
