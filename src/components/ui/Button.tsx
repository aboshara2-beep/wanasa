import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet,
  ActivityIndicator, ViewStyle, TextStyle,
} from 'react-native';
import { Colors, Radius, Typography, Spacing } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface Props {
  label:      string;
  onPress:    () => void;
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  disabled?:  boolean;
  style?:     ViewStyle;
  textStyle?: TextStyle;
  icon?:      React.ReactNode;
}

export function Button({
  label, onPress, variant = 'primary',
  size = 'md', loading, disabled, style, textStyle, icon,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator
            color={variant === 'primary' ? '#fff' : Colors.primary}
            size="small"
          />
        : <>
            {icon}
            <Text style={[styles.text, styles[`text_${variant}`], textStyle]}>
              {label}
            </Text>
          </>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            Spacing.xs,
    borderRadius:   Radius.md,
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.error,
  },

  // Sizes
  size_sm: { paddingVertical: 6,  paddingHorizontal: 14 },
  size_md: { paddingVertical: 12, paddingHorizontal: 24 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 32 },

  // Disabled
  disabled: { opacity: 0.5 },

  // Text
  text: {
    fontWeight: Typography.weights.bold,
    fontSize:   Typography.sizes.base,
  },
  text_primary:   { color: Colors.textPrimary },
  text_secondary: { color: Colors.textPrimary },
  text_ghost:     { color: Colors.primary },
  text_danger:    { color: Colors.textPrimary },
});
