// Design System - Consistent theme across the application

export const colors = {
  // Primary colors
  primary: '#667eea',
  primaryDark: '#5a67d8',
  primaryLight: '#7c3aed',
  primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

  // Neutral colors
  gray50: '#f9fafb',
  gray100: '#f7fafc',
  gray200: '#edf2f7',
  gray300: '#e2e8f0',
  gray400: '#cbd5e0',
  gray500: '#a0aec0',
  gray600: '#718096',
  gray700: '#4a5568',
  gray800: '#2d3748',
  gray900: '#1a202c',

  // Semantic colors
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  // Background
  background: '#f5f7fa',
  white: '#ffffff',

  // Status colors
  statusA: '#10b981',
  statusB: '#3b82f6',
  statusC: '#f59e0b',
  statusD: '#ef4444',
  statusF: '#dc2626'
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px'
};

export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  xxl: '14px',
  full: '9999px'
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 12px rgba(0, 0, 0, 0.06)',
  xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xxl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  primaryGlow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  none: 'none'
};

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  },
  fontSize: {
    xs: '11px',
    sm: '13px',
    base: '14px',
    md: '15px',
    lg: '16px',
    xl: '18px',
    xxl: '20px',
    xxxl: '24px',
    display: '28px',
    hero: '32px'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
};

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out'
};

// Component styles
export const card = {
  base: {
    background: colors.white,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.lg,
    padding: spacing.xl
  }
};

export const button = {
  primary: {
    background: colors.primaryGradient,
    color: colors.white,
    border: 'none',
    borderRadius: borderRadius.lg,
    padding: `${spacing.md} ${spacing.lg}`,
    fontWeight: typography.fontWeight.bold,
    cursor: 'pointer',
    boxShadow: shadows.primaryGlow,
    transition: transitions.normal
  },
  secondary: {
    background: colors.gray100,
    color: colors.gray700,
    border: `1px solid ${colors.gray300}`,
    borderRadius: borderRadius.lg,
    padding: `${spacing.md} ${spacing.lg}`,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: transitions.normal
  },
  danger: {
    background: colors.errorLight,
    color: colors.error,
    border: `1px solid ${colors.error}33`,
    borderRadius: borderRadius.md,
    padding: `${spacing.sm} ${spacing.md}`,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: transitions.normal
  }
};

export const input = {
  base: {
    width: '100%',
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.gray300}`,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.sans,
    transition: transitions.normal,
    outline: 'none'
  }
};

export const badge = {
  primary: {
    display: 'inline-block',
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    background: `${colors.primary}20`,
    color: colors.primary
  },
  success: {
    display: 'inline-block',
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    background: `${colors.success}20`,
    color: colors.success
  }
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  transitions,
  card,
  button,
  input,
  badge
};
