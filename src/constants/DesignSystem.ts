/**
 * Jeeva Learning App Design System
 * Centralized design tokens for colors, typography, spacing, and more
 */

import { Platform } from 'react-native'

export const DesignSystem = {
  // Color Palette
  colors: {
    // Primary Brand Colors
    primary: {
      main: '#3B82F6',      // Blue 500
      light: '#60A5FA',     // Blue 400
      dark: '#2563EB',      // Blue 600
      darker: '#1D4ED8',    // Blue 700
    },

    // Background Colors
    background: {
      main: '#F5F7FA',      // Main app background (very light gray)
      card: '#FFFFFF',      // Card/container background
      secondary: '#F9FAFB', // Alternative background
      dark: '#111827',      // Dark background
    },

    // Text Colors
    text: {
      primary: '#111827',   // Primary text (almost black)
      secondary: '#6B7280', // Secondary text (gray)
      tertiary: '#9CA3AF',  // Tertiary text (light gray)
      inverse: '#FFFFFF',   // White text
      link: '#3B82F6',      // Link blue
    },

    // UI Element Colors
    ui: {
      border: '#E5E7EB',    // Border color
      divider: '#E0E0E0',   // Divider color
      input: '#F8F8F8',     // Input background
      inputBorder: '#E8E8E8', // Input border
    },

    // Semantic Colors
    semantic: {
      success: '#10B981',   // Green
      warning: '#F59E0B',   // Orange/Amber
      error: '#EF4444',     // Red
      info: '#3B82F6',      // Blue
    },

    // Accent Colors
    accent: {
      yellow: '#FEF3C7',    // Light yellow
      orange: '#D97706',    // Orange
      lightBlue: '#EFF6FF', // Very light blue
    },
  },

  // Typography
  typography: {
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    // Standard Text Styles
    styles: {
      greeting: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
      },
      cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827', // or '#FFFFFF' for cards with colored backgrounds
      },
      bodyText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#6B7280', // or 'rgba(255,255,255,0.85)' for colored backgrounds
      },
      buttonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF', // or '#3B82F6' for white buttons
      },
      labelText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#111827',
      },
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
  },

  // Border Radius
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 12,
    xl: 16,
    '2xl': 20,
    full: 9999,
  },

  // Modern Shadows (CSS boxShadow + legacy RN shadow support)
  shadows: {
    sm: {
      boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
    },
    md: {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    },
    lg: {
      boxShadow: '0px 4px 10px rgba(59, 130, 246, 0.25)',
    },
  },

  // Platform-aware shadows using Platform.select
  platformShadows: {
    sm: {
      boxShadow: Platform.select({
        web: '0px 2px 6px rgba(0, 0, 0, 0.08)',
        default: undefined,
      }),
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: { elevation: 2 },
        default: {},
      }),
    },
    md: {
      boxShadow: Platform.select({
        web: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        default: undefined,
      }),
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: { elevation: 4 },
        default: {},
      }),
    },
    lg: {
      boxShadow: Platform.select({
        web: '0px 4px 10px rgba(59, 130, 246, 0.25)',
        default: undefined,
      }),
      ...Platform.select({
        ios: {
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        android: { elevation: 5 },
        default: {},
      }),
    },
  },

  // Icon Sizes
  iconSizes: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
  },

  // Component Heights
  heights: {
    input: 48,
    button: 44,
    smallButton: 36,
    largeButton: 52,
    tabBar: 72,
    header: 80,
    avatar: {
      sm: 32,
      md: 36,
      lg: 48,
      xl: 64,
    },
    quickActionIcon: 56,
  },

  // Layout Specifications
  layout: {
    horizontalPadding: 16,      // Safe area padding
    screenPadding: 16,          // Screen edge padding
    contentPadding: 20,         // Content block padding
    cardPadding: 20,            // Card internal padding
    sectionSpacing: 20,         // Space between sections
    itemSpacing: 12,            // Space between items
  },

  // Button Specifications
  buttons: {
    // Primary Button (filled, colored background)
    primary: {
      height: 44,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: '#3B82F6',
      fontSize: 14,
      fontWeight: '500',
      textColor: '#FFFFFF',
    },
    // Secondary Button (white background, colored text)
    secondary: {
      height: 44,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
      textColor: '#3B82F6',
    },
    // Small Button
    small: {
      height: 36,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      fontSize: 13,
      fontWeight: '500',
    },
    // Large Button
    large: {
      height: 52,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
      fontSize: 16,
      fontWeight: '500',
    },
  },

  // Card Specifications (platform-aware shadows)
  cards: {
    default: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      boxShadow: Platform.select({
        web: '0px 2px 6px rgba(0, 0, 0, 0.08)',
        default: undefined,
      }),
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: { elevation: 2 },
        default: {},
      }),
    },
    promotional: {
      backgroundColor: '#3B82F6',
      borderRadius: 16,
      padding: 20,
      boxShadow: Platform.select({
        web: '0px 4px 10px rgba(59, 130, 246, 0.25)',
        default: undefined,
      }),
      ...Platform.select({
        ios: {
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        android: { elevation: 5 },
        default: {},
      }),
    },
  },

  // Input Field Specifications
  inputs: {
    default: {
      height: 48,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: '#F8F8F8',
      borderWidth: 1,
      borderColor: '#E8E8E8',
      fontSize: 14,
      fontWeight: '400',
      textColor: '#111827',
      placeholderColor: '#9CA3AF',
    },
    focused: {
      borderColor: '#3B82F6',
      borderWidth: 2,
    },
  },

  // Quick Action Icon Specifications
  quickActions: {
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: '#EFF6FF',
    },
    iconSize: 24,
    iconColor: '#3B82F6',
    labelFontSize: 13,
    labelFontWeight: '500',
    labelColor: '#111827',
    labelMarginTop: 8,
  },

  // Badge Specifications
  badges: {
    default: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    warning: {
      backgroundColor: '#FEF3C7',
      textColor: '#D97706',
    },
    success: {
      backgroundColor: '#D1FAE5',
      textColor: '#059669',
    },
    info: {
      backgroundColor: '#DBEAFE',
      textColor: '#2563EB',
    },
  },

  // Avatar Specifications
  avatars: {
    small: {
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 14,
      fontWeight: '600',
    },
    medium: {
      width: 36,
      height: 36,
      borderRadius: 18,
      fontSize: 14,
      fontWeight: '600',
    },
    large: {
      width: 48,
      height: 48,
      borderRadius: 24,
      fontSize: 18,
      fontWeight: '700',
    },
  },

  // Navigation Bar Specifications
  navigation: {
    tabBar: {
      height: 72,
      paddingBottom: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      backgroundColor: '#FFFFFF',
      activeTintColor: '#3B82F6',
      inactiveTintColor: '#9CA3AF',
      labelFontSize: 12,
      labelFontWeight: '500',
      iconSize: 22,
    },
    header: {
      height: 80,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 16,
    },
  },
} as const

// Export individual design tokens for convenience
export const Colors = DesignSystem.colors
export const Typography = DesignSystem.typography
export const Spacing = DesignSystem.spacing
export const BorderRadius = DesignSystem.borderRadius
export const Shadows = DesignSystem.shadows
export const PlatformShadows = DesignSystem.platformShadows
export const Layout = DesignSystem.layout
export const Buttons = DesignSystem.buttons
export const Cards = DesignSystem.cards
export const Inputs = DesignSystem.inputs
export const QuickActions = DesignSystem.quickActions
export const Badges = DesignSystem.badges
export const Avatars = DesignSystem.avatars
export const Navigation = DesignSystem.navigation
