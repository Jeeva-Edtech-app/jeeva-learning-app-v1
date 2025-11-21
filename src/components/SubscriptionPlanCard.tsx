import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, DesignSystem } from '@/constants/DesignSystem';

interface PlanCardProps {
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function SubscriptionPlanCard({
  name,
  price,
  duration,
  features,
  isPopular = false,
  isSelected = false,
  onSelect,
}: PlanCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isPopular && styles.cardPopular,
      ]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>⭐ RECOMMENDED</Text>
        </View>
      )}

      <View style={styles.headerContainer}>
        <Text style={styles.planName}>{name}</Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={Colors.primary.main} />
        )}
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
        <Text style={styles.billingPeriod}>per {duration}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark" size={18} color={Colors.semantic.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.selectButton, isSelected && styles.selectButtonActive]}
        onPress={onSelect}
      >
        <Text style={[styles.selectButtonText, isSelected && styles.selectButtonTextActive]}>
          {isSelected ? 'SELECTED' : 'SELECT'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    ...DesignSystem.platformShadows.sm,
  },
  cardSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: '#F0F8FF',
  },
  cardPopular: {
    borderColor: '#FFE0B2',
    backgroundColor: '#FFFAF0',
  },
  popularBadge: {
    backgroundColor: '#FFE0B2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E65100',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  billingPeriod: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  featuresContainer: {
    marginVertical: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  selectButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonActive: {
    backgroundColor: Colors.primary.main,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  selectButtonTextActive: {
    color: '#FFFFFF',
  },
});
