export const Colors = {
  primary:        '#FF6B2C',
  primaryLight:   '#FF8F5E',
  primaryDark:    '#E5501A',
  primaryGlow:    'rgba(255,107,44,0.25)',
  background:     '#080808',
  surface:        'rgba(255,255,255,0.05)',
  surfaceElevated:'rgba(255,255,255,0.07)',
  surfaceHigh:    'rgba(255,255,255,0.09)',
  surfaceBorder:  'rgba(255,255,255,0.10)',
  glass:          'rgba(15,15,15,0.75)',
  glassBorder:    'rgba(255,107,44,0.15)',
  border:         'rgba(255,255,255,0.10)',
  textPrimary:    '#FFFFFF',
  textSecondary:  'rgba(255,255,255,0.65)',
  textMuted:      'rgba(255,255,255,0.35)',
  gold:           '#FFD700',
  success:        '#22C55E',
  error:          '#EF4444',
  info:           '#3B82F6',
};

export const Typography = {
  sizes: {
    xxl:32, xl:24, lg:20, md:17,
    base:15, sm:13, xs:11, xxs:10,
  },
  weights: {
    regular:   '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
  },
  // Presets
  hero:    { fontSize:52, lineHeight:60, fontWeight:'800' as const },
  h1:      { fontSize:32, lineHeight:40, fontWeight:'800' as const },
  h2:      { fontSize:24, lineHeight:30, fontWeight:'700' as const },
  label:   { fontSize:13, lineHeight:18, fontWeight:'600' as const },
  body:    { fontSize:15, lineHeight:22, fontWeight:'400' as const },
  caption: { fontSize:11, lineHeight:15, fontWeight:'500' as const },
  micro:   { fontSize:10, lineHeight:13, fontWeight:'600' as const },
};

export const Spacing = {
  xs:4, sm:8, md:16, lg:24, xl:32, xxl:48,
};

export const Radius = {
  sm:8, md:12, lg:16, xl:24, xxl:32, full:999,
};

export const Springs = {
  snappy: { damping:25, stiffness:400, mass:0.8 },
  smooth: { damping:20, stiffness:200, mass:1.0 },
  bouncy: { damping:12, stiffness:180, mass:1.2 },
  gentle: { damping:18, stiffness:120, mass:1.0 },
};

export const Timing = {
  instant:80, fast:150, normal:250, slow:400, verySlow:600,
};
