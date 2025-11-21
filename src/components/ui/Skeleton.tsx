import React, { useEffect, useRef } from 'react';
import { Animated, ColorValue, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type SkeletonWidth = number | `${number}%` | 'auto';
type SkeletonGradient = readonly [ColorValue, ColorValue, ...ColorValue[]];

const DEFAULT_COLORS: SkeletonGradient = ['#F3F4F680', '#E5E7EBDD', '#F3F4F680'];

interface SkeletonProps {
  width?: SkeletonWidth;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  colors?: SkeletonGradient;
}

export function Skeleton({
  width = '100%' as SkeletonWidth,
  height = 16,
  borderRadius = 12,
  style,
  colors = DEFAULT_COLORS,
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });

  return (
    <Animated.View
      style={[
        {
          overflow: 'hidden',
          width,
          height,
          borderRadius,
          backgroundColor: colors[1] ?? DEFAULT_COLORS[1],
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </Animated.View>
  );
}
