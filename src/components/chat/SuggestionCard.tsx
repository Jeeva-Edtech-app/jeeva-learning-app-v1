import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';

interface SuggestionCardProps {
  label: string;
  onPress: () => void;
}

export default function SuggestionCard({ label, onPress }: SuggestionCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // 10% opacity light blue
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.1)',
  },
  label: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontFamily: 'Inter_500Medium',
    color: DesignSystem.colors.primary.main,
    lineHeight: 20,
  },
});
