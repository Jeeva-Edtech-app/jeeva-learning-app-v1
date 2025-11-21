import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { DesignSystem } from '@/constants/DesignSystem';

/**
 * Toast notification utilities using Jeeva Learning design tokens
 */

export const showToast = {
  success: (message: string, duration: number = 3000) => {
    Toast.show({
      type: 'success',
      text1: message,
      position: 'top',
      visibilityTime: duration,
      topOffset: 60,
    });
  },

  error: (message: string, duration: number = 4000) => {
    Toast.show({
      type: 'error',
      text1: message,
      position: 'top',
      visibilityTime: duration,
      topOffset: 60,
    });
  },

  info: (message: string, duration: number = 3000) => {
    Toast.show({
      type: 'info',
      text1: message,
      position: 'top',
      visibilityTime: duration,
      topOffset: 60,
    });
  },

  warning: (message: string, duration: number = 3000) => {
    Toast.show({
      type: 'warning',
      text1: message,
      position: 'top',
      visibilityTime: duration,
      topOffset: 60,
    });
  },
};

const styles = StyleSheet.create({
  toastContainer: {
    paddingHorizontal: DesignSystem.spacing.base,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    marginHorizontal: DesignSystem.spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toastText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium as any,
  },
});

export const toastConfig = {
  success: ({ text1 }: any) => (
    <View
      style={[
        styles.toastContainer,
        { backgroundColor: DesignSystem.colors.semantic.success },
      ]}
    >
      <Text style={styles.toastText}>✓ {text1}</Text>
    </View>
  ),

  error: ({ text1 }: any) => (
    <View
      style={[
        styles.toastContainer,
        { backgroundColor: DesignSystem.colors.semantic.error },
      ]}
    >
      <Text style={styles.toastText}>⚠ {text1}</Text>
    </View>
  ),

  info: ({ text1 }: any) => (
    <View
      style={[
        styles.toastContainer,
        { backgroundColor: DesignSystem.colors.semantic.info },
      ]}
    >
      <Text style={styles.toastText}>ℹ {text1}</Text>
    </View>
  ),

  warning: ({ text1 }: any) => (
    <View
      style={[
        styles.toastContainer,
        { backgroundColor: DesignSystem.colors.semantic.warning },
      ]}
    >
      <Text style={styles.toastText}>⚡ {text1}</Text>
    </View>
  ),
};
