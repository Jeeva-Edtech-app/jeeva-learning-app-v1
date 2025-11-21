import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useAuth } from '@/context/AuthContext';
import { DesignSystem } from '@/constants/DesignSystem';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isStreaming?: boolean;
}

interface ChatBubbleProps {
  message: Message;
}

const getInitials = (name: string) => {
  if (!name) return 'U';
  const names = name.trim().split(/\s+/);
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return names[0][0].toUpperCase();
};

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Optionally show an error toast or feedback to user
    }
  };

  const renderUserAvatar = () => {
    const displayName = user?.user_metadata?.full_name || user?.email || 'User';
    const initials = getInitials(displayName);
    
    return (
      <View style={styles.userAvatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const renderAssistantAvatar = () => (
    <View style={styles.assistantAvatar}>
      <Image
        source={require('../../assets/images/favicon.png')}
        style={styles.assistantAvatarImage}
      />
    </View>
  );

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View style={styles.bubbleContainer}>
        {!isUser && renderAssistantAvatar()}

        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {isUser ? (
            <Text style={[styles.messageText, styles.userMessageText]}>
              {message.content}
            </Text>
          ) : (
            <Markdown style={markdownStyles}>
              {message.content}
            </Markdown>
          )}
          
          {!isUser && (
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy} hitSlop={8}>
              <Ionicons 
                name={copied ? "checkmark" : "copy-outline"} 
                size={14} 
                color={copied ? DesignSystem.colors.semantic.success : DesignSystem.colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {isUser && renderUserAvatar()}
      </View>
    </View>
  );
}

const markdownStyles: any = {
  body: {
    fontSize: DesignSystem.typography.fontSize.base,
    lineHeight: 20,
    color: DesignSystem.colors.text.primary,
    fontFamily: 'Inter_400Regular',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  strong: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  em: {
    fontStyle: 'italic',
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontFamily: 'monospace',
  },
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
    alignSelf: 'stretch',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignSystem.colors.accent.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assistantAvatarImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignSystem.colors.accent.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignSystem.colors.primary.main,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
    position: 'relative',
    flex: 1,
  },
  userBubble: {
    backgroundColor: DesignSystem.colors.accent.lightBlue,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: DesignSystem.typography.fontSize.base,
    lineHeight: 20,
    color: DesignSystem.colors.text.primary,
    fontFamily: 'Inter_400Regular',
  },
  userMessageText: {
    color: DesignSystem.colors.text.primary,
    fontWeight: '500',
  },
  copyButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
