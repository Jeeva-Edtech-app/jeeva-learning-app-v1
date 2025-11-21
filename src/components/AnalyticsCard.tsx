import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: number;
}

export function AnalyticsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor = '#3B82F6',
  trend 
}: AnalyticsCardProps) {
  const trendColor = trend && trend > 0 ? '#10B981' : trend && trend < 0 ? '#EF4444' : '#6B7280';
  
  return (
    <View style={styles.card}>
      <View style={styles.leftContainer}>
        {icon && (
          <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.value}>{value}</Text>
        {trend !== undefined && trend !== 0 && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={trend > 0 ? 'trending-up' : 'trending-down'} 
              size={14} 
              color={trendColor} 
            />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {trend > 0 ? '+' : ''}{trend}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    flexShrink: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter_700Bold',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'Inter_500Medium',
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});
