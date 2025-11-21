import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/constants/DesignSystem';
import { VoiceHookReturn } from '@/hooks/useVoiceInput';
import { useChatbot } from '@/hooks/useChatbot';

interface ChatComposerProps {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isSending?: boolean;
  voice: VoiceHookReturn;
}

export default function ChatComposer({
  value,
  onChange,
  onSend,
  disabled,
  isSending,
  voice,
}: ChatComposerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { suggestions, rateLimit } = useChatbot();

  const hasText = value.trim().length > 0;
  const isRecording = voice.status === 'recording';
  const isProcessing = voice.status === 'processing';
  const showSendButton = (hasText || isProcessing) && !disabled;
  const hasSuggestions = suggestions.length > 0 && !value.trim() && !isSending;

  const handleMicPress = async () => {
    if (isRecording) {
      await voice.stopRecording();
    } else {
      await voice.startRecording();
    }
  };

  const handleCancelVoice = async () => {
    await voice.cancelRecording();
  };

  const handleSend = () => {
    if (disabled || (!hasText && !isProcessing)) return;
    onSend();
    inputRef.current?.blur();
  };

  const insertSuggestion = (suggestion: string) => {
    onChange(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Suggestions Bar */}
      {hasSuggestions && (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContent}
            keyboardShouldPersistTaps="handled"
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => insertSuggestion(suggestion)}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" color="#007AFF" size={14} />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recording Banner */}
      {(isRecording || isProcessing) && (
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Ionicons name="sparkles" size={16} color="#1F2937" />
            <Text style={styles.bannerText}>
              {isRecording ? '🎤 Listening... tap to stop' : '✨ Converting speech to text'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleCancelVoice} hitSlop={16}>
            <Text style={styles.bannerAction}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Container */}
      <View style={styles.container}>
        <View style={[styles.inputContainer, { 
          borderColor: isFocused ? DesignSystem.colors.primary.main : DesignSystem.colors.ui.inputBorder
        }]}>
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleMicPress}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isRecording ? "stop-circle" : "mic"}
              size={20}
              color={isRecording ? DesignSystem.colors.semantic.error : DesignSystem.colors.text.secondary}
            />
          </TouchableOpacity>
          
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={onChange}
            editable={!disabled}
            multiline
            numberOfLines={1}
            placeholder="Message JeevaBot..."
            placeholderTextColor={DesignSystem.colors.text.tertiary}
            maxLength={500}
            textAlignVertical="center"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleSend}
          />
          
          <View style={styles.rightButtons}>
            {/* Rate Limit Indicator */}
            {rateLimit && (
              <View style={styles.rateLimitContainer}>
                <Text style={styles.rateLimitText}>
                  {rateLimit.remaining}/10
                </Text>
              </View>
            )}
            
            {/* Send Button */}
            {showSendButton && (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (disabled || isSending) && styles.sendButtonDisabled
                ]}
                onPress={handleSend}
                disabled={disabled || isSending}
                activeOpacity={0.7}
              >
                {isSending ? (
                  <Ionicons name="refresh" size={18} color={DesignSystem.colors.text.secondary} />
                ) : (
                  <Ionicons name="send" size={18} color={DesignSystem.colors.primary.main} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: DesignSystem.colors.background.main,
  },
  banner: {
    backgroundColor: DesignSystem.colors.accent.lightBlue,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.primary,
    fontFamily: 'Inter_500Medium',
    marginLeft: 6,
  },
  bannerAction: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.primary.main,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.ui.input,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    minHeight: 48,
    ...DesignSystem.platformShadows.sm,
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: DesignSystem.borderRadius.full,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.text.primary,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 0,
    paddingVertical: 0,
    maxHeight: 120,
    lineHeight: 20,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateLimitContainer: {
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
  },
  rateLimitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: DesignSystem.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: DesignSystem.colors.background.main,
  },
  suggestionsContent: {
    alignItems: 'center',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 100,
    maxWidth: 200,
  },
  suggestionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },
});
