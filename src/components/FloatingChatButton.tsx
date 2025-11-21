import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { LessonContextPayload } from '@/hooks/useChatbot';
import { Ionicons } from '@expo/vector-icons';
import { Colors, DesignSystem } from '@/constants/DesignSystem';

interface FloatingChatButtonProps {
  context?: LessonContextPayload;
  prompt?: string;
  style?: ViewStyle;
}

const serialize = (value: unknown) => encodeURIComponent(JSON.stringify(value));

export default function FloatingChatButton({ context, prompt, style }: FloatingChatButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    const params: Record<string, string> = {};
    if (context) {
      params.ctx = serialize(context);
    }
    if (prompt) {
      params.prompt = encodeURIComponent(prompt);
    }
    router.push({
      pathname: '/(tabs)/ai-assistant',
      params,
    });
  };

  return (
    <TouchableOpacity
      style={[styles.wrapper, style]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circle}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubble-ellipses" size={28} color={Colors.text.inverse} />
          </View>
        </LinearGradient>
        <Text style={styles.label}>Ask AI</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    zIndex: 20,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.platformShadows.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.25,
    color: Colors.text.primary,
  },
});
