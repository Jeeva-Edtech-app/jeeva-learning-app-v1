import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ChatBubble from '@/components/ChatBubble';
import ChatComposer from '@/components/chat/ChatComposer';
import SuggestionCard from '@/components/chat/SuggestionCard';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { DesignSystem } from '@/constants/DesignSystem';
import { useChatbot } from '@/hooks/useChatbot';


export default function JeevaBotScreen() {
  const {
    messages,
    composerText,
    setComposerText,
    sendMessage,
    isSending,
    isTyping,
    errorBanner,
    clearError,
    suggestions,
    selectSuggestion,
    canSend,
    voice,
    applyLessonContext,
    resetConversation,
  } = useChatbot();

  const router = useRouter();
  const params = useLocalSearchParams<{ ctx?: string; prompt?: string }>();
  const appliedContextRef = useRef<string | null>(null);
  const appliedPromptRef = useRef<string | null>(null);

  const [showMenu, setShowMenu] = useState(false);

  const listRef = useRef<FlatList>(null);
  const errorOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages]);

  React.useEffect(() => {
    if (errorBanner) {
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(errorOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [errorBanner, errorOpacity]);

  React.useEffect(() => {
    if (typeof params.ctx === 'string' && params.ctx !== appliedContextRef.current) {
      try {
        const decoded = decodeURIComponent(params.ctx);
        const parsed = JSON.parse(decoded);
        applyLessonContext(parsed);
        appliedContextRef.current = params.ctx;
      } catch (error) {
        console.warn('Failed to parse chat context param', error);
      }
    }
  }, [applyLessonContext, params.ctx]);

  React.useEffect(() => {
    if (typeof params.prompt === 'string' && params.prompt !== appliedPromptRef.current) {
      try {
        const decoded = decodeURIComponent(params.prompt);
        setComposerText(decoded);
        appliedPromptRef.current = params.prompt;
      } catch (error) {
        console.warn('Failed to parse prompt param', error);
      }
    }
  }, [params.prompt, setComposerText]);

  const handleSuggestionPress = (label: string, autoSend = false) => {
    selectSuggestion(label);
    if (autoSend) {
      setTimeout(() => sendMessage(label), 50);
    }
  };

  const handleClearChat = () => {
    setShowMenu(false);
    Alert.alert('Clear Chat', 'Are you sure you want to clear all messages?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Clear',
        onPress: () => {
          resetConversation();
        },
        style: 'destructive',
      },
    ]);
  };

  const handleExit = () => {
    setShowMenu(false);
    router.back();
  };

  const renderMessage = ({ item }: { item: any }) => <ChatBubble message={item} />;

  const renderFooter = () =>
    isTyping ? (
      <View style={styles.typingRow}>
        <View style={styles.typingAvatar}>
          <Text style={styles.typingAvatarEmoji}>🤖</Text>
        </View>
        <View style={styles.typingBubble}>
          <TypingIndicator />
        </View>
      </View>
    ) : null;

  const renderEmptyState = () => (
    <ScrollView
      style={styles.emptyScroll}
      contentContainerStyle={styles.emptyContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroAvatar}>
        <Image 
          source={require('@/assets/images/splash-icon.png')} 
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.heroSubtitle}>
        Ask me anything about your lessons!
      </Text>
    </ScrollView>
  );

  const renderInlineSuggestions = () => {
    if (messages.length === 0 || suggestions.length === 0) return null;
    return (
      <View style={styles.inlineSuggestions}>
        {suggestions.map((item, index) => (
          <TouchableOpacity
            key={item}
            style={styles.inlineSuggestion}
            onPress={() => handleSuggestionPress(item, true)}
            activeOpacity={0.7}
          >
            <Text style={styles.inlineSuggestionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIcon}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={DesignSystem.colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>JeevaBot</Text>
          </View>
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.headerIcon} 
              activeOpacity={0.7}
              onPress={() => setShowMenu(!showMenu)}
            >
              <Ionicons name="ellipsis-vertical" size={22} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
            {showMenu && (
              <View style={styles.menuDropdown}>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={handleClearChat}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={DesignSystem.colors.text.primary} />
                  <Text style={styles.menuItemText}>Clear Chat</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={handleExit}
                  activeOpacity={0.7}
                >
                  <Ionicons name="exit-outline" size={18} color={DesignSystem.colors.semantic.error} />
                  <Text style={[styles.menuItemText, { color: DesignSystem.colors.semantic.error }]}>Exit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.body}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messageList,
              messages.length === 0 && styles.messageListEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
          {renderInlineSuggestions()}
        </View>

        {errorBanner ? (
          <Animated.View style={[styles.errorBanner, { opacity: errorOpacity }]}>
            <Text style={styles.errorText}>{errorBanner}</Text>
            <TouchableOpacity onPress={clearError} hitSlop={16}>
              <Ionicons name="close" size={18} color="#7F1D1D" />
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        <ChatComposer
          value={composerText}
          onChange={setComposerText}
          onSend={() => sendMessage()}
          disabled={!canSend}
          isSending={isSending}
          voice={voice}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.ui.border,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    zIndex: 100,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: DesignSystem.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: DesignSystem.colors.text.tertiary,
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },
  body: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  messageListEmpty: {
    flexGrow: 1,
  },
  emptyScroll: {
    width: '100%',
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroImage: {
    width: 80,
    height: 80,
  },
  heroSubtitle: {
    fontSize: 16,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    marginBottom: 24,
  },
  menuContainer: {
    position: 'relative',
  },
  menuDropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 160,
    zIndex: 1000,
    overflow: 'visible',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: DesignSystem.colors.text.primary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: DesignSystem.colors.ui.border,
  },
  suggestionList: {
    width: '100%',
  },
  inlineSuggestions: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  inlineSuggestion: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  inlineSuggestionText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.primary.main,
    fontFamily: 'Inter_500Medium',
    textAlign: 'left',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignSystem.colors.accent.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typingAvatarEmoji: {
    fontSize: 18,
    color: DesignSystem.colors.primary.main,
  },
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginLeft: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    color: '#7F1D1D',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    marginRight: 12,
  },
});
