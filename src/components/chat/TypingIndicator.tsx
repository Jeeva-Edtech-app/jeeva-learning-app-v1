import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';

const DOT_COUNT = 3;

export default function TypingIndicator() {
  const animations = React.useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0)),
  ).current;

  React.useEffect(() => {
    const createAnimation = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

    const loops = animations.map((value, index) =>
      createAnimation(value, index * 120),
    );

    loops.forEach(loop => loop.start());

    return () => {
      loops.forEach(loop => loop.stop());
    };
  }, [animations]);

  return (
    <View style={styles.container}>
      {animations.map((animation, index) => {
        const scale = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        });
        const opacity = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 1],
        });

        return (
          <Animated.View
            key={`typing-dot-${index}`}
            style={[
              styles.dot,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignSystem.colors.primary.main,
    marginHorizontal: 2,
  },
});
