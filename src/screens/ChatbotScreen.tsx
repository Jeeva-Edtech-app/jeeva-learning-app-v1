import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { InnerPageHeader } from '@/components/ui/InnerPageHeader'
import { FAQ_DATA, FAQCategory, FAQQuestion } from '@/data/faqData'
import { Colors, DesignSystem } from '@/constants/DesignSystem'
import { showToast } from '@/utils/toast'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile } from '@/hooks/useProfile'
import * as Linking from 'expo-linking'

type ChatbotState = 'menu' | 'category' | 'answer' | 'escalation'

interface ChatMessage {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
}

interface InnerPageHeaderProps {
  title: string
  onBack?: () => void
}

export default function ChatbotScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: profile } = useUserProfile(user?.id || '')

  const [state, setState] = useState<ChatbotState>('menu')
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<FAQQuestion | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Welcome to Jeeva Support! How can I help you today?',
      timestamp: new Date(),
    },
  ])

  const [escalationName, setEscalationName] = useState('')
  const [escalationEmail, setEscalationEmail] = useState('')
  const [escalationDescription, setEscalationDescription] = useState('')
  const [escalationLoading, setEscalationLoading] = useState(false)

  const handleCategorySelect = (category: FAQCategory) => {
    setSelectedCategory(category)
    setState('category')
    addMessage('bot', `Great! Here are questions about ${category.name}.`)
  }

  const handleQuestionSelect = (question: FAQQuestion) => {
    setSelectedQuestion(question)
    setState('answer')
    addMessage('user', question.question)
    addMessage('bot', question.answer)
  }

  const addMessage = (type: 'bot' | 'user', content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        type,
        content,
        timestamp: new Date(),
      },
    ])
  }

  const handleEscalate = async () => {
    if (!escalationEmail.trim() || !escalationDescription.trim()) {
      showToast.error('Please fill in all fields')
      return
    }

    setEscalationLoading(true)

    try {
      // Simulate sending email - in production, use Resend or email service
      const subject = encodeURIComponent('Support Request from Jeeva Learning')
      const body = encodeURIComponent(
        `Name: ${escalationName || profile?.full_name || 'User'}\n` +
          `Email: ${escalationEmail}\n` +
          `Original Question: ${selectedQuestion?.question || 'General Support'}\n\n` +
          `Description:\n${escalationDescription}`
      )

      await Linking.openURL(`mailto:support@jeevalearning.com?subject=${subject}&body=${body}`)

      showToast.success('Opening email app with your support request...')
      setTimeout(() => {
        setState('menu')
        setSelectedCategory(null)
        setSelectedQuestion(null)
        setEscalationName('')
        setEscalationEmail('')
        setEscalationDescription('')
      }, 500)
    } catch (error) {
      showToast.error('Could not open email app. Please try again.')
    } finally {
      setEscalationLoading(false)
    }
  }

  const handleBackPress = () => {
    if (state === 'answer') {
      setState('category')
      setSelectedQuestion(null)
    } else if (state === 'category') {
      setState('menu')
      setSelectedCategory(null)
    } else if (state === 'escalation') {
      setState('answer')
      setEscalationName('')
      setEscalationEmail('')
      setEscalationDescription('')
    } else {
      router.back()
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <InnerPageHeader title="Support" onBack={handleBackPress} />

      {state === 'menu' && <MenuView categories={FAQ_DATA} onSelect={handleCategorySelect} />}

      {state === 'category' && selectedCategory && (
        <CategoryView
          category={selectedCategory}
          onSelectQuestion={handleQuestionSelect}
          onBack={handleBackPress}
        />
      )}

      {state === 'answer' && selectedQuestion && (
        <AnswerView
          question={selectedQuestion}
          onEscalate={() => setState('escalation')}
          onBack={handleBackPress}
        />
      )}

      {state === 'escalation' && selectedQuestion && (
        <EscalationView
          questionTitle={selectedQuestion.question}
          name={escalationName}
          onNameChange={setEscalationName}
          email={escalationEmail}
          onEmailChange={setEscalationEmail}
          description={escalationDescription}
          onDescriptionChange={setEscalationDescription}
          onEscalate={handleEscalate}
          loading={escalationLoading}
          onBack={handleBackPress}
          userEmail={user?.email || ''}
        />
      )}
    </SafeAreaView>
  )
}

function MenuView({
  categories,
  onSelect,
}: {
  categories: FAQCategory[]
  onSelect: (category: FAQCategory) => void
}) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.greeting}>
        <Text style={styles.greetingTitle}>How can we help?</Text>
        <Text style={styles.greetingSubtitle}>
          Choose a category below or escalate to email support
        </Text>
      </View>

      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => onSelect(category)}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryDesc}>{category.description}</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.primary.main}
              style={styles.chevron}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

function CategoryView({
  category,
  onSelectQuestion,
  onBack,
}: {
  category: FAQCategory
  onSelectQuestion: (question: FAQQuestion) => void
  onBack: () => void
}) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryHeaderIcon}>{category.icon}</Text>
        <Text style={styles.categoryHeaderTitle}>{category.name}</Text>
      </View>

      <View style={styles.questionsList}>
        {category.questions.map((question, index) => (
          <View key={question.id}>
            <TouchableOpacity
              style={styles.questionItem}
              onPress={() => onSelectQuestion(question)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={Colors.primary.main}
                style={styles.questionIcon}
              />
              <View style={styles.questionContent}>
                <Text style={styles.questionText}>{question.question}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.ui.border} />
            </TouchableOpacity>
            {index < category.questions.length - 1 && <View style={styles.questionDivider} />}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

function AnswerView({
  question,
  onEscalate,
  onBack,
}: {
  question: FAQQuestion
  onEscalate: () => void
  onBack: () => void
}) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.answerCard}>
        <Text style={styles.answerQuestion}>{question.question}</Text>
      </View>

      <View style={styles.answerContent}>
        <Text style={styles.answerText}>{question.answer}</Text>
      </View>

      <View style={styles.answerActions}>
        <Text style={styles.actionLabel}>Was this helpful?</Text>
        <View style={styles.ratingButtons}>
          <TouchableOpacity style={styles.ratingButton}>
            <Ionicons name="thumbs-up-outline" size={20} color={Colors.semantic.success} />
            <Text style={styles.ratingButtonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ratingButton}>
            <Ionicons name="thumbs-down-outline" size={20} color={Colors.semantic.error} />
            <Text style={styles.ratingButtonText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.escalateButton}
        onPress={onEscalate}
        activeOpacity={0.8}
      >
        <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
        <Text style={styles.escalateButtonText}>Need more help? Email us</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function EscalationView({
  questionTitle,
  name,
  onNameChange,
  email,
  onEmailChange,
  description,
  onDescriptionChange,
  onEscalate,
  loading,
  onBack,
  userEmail,
}: {
  questionTitle: string
  name: string
  onNameChange: (text: string) => void
  email: string
  onEmailChange: (text: string) => void
  description: string
  onDescriptionChange: (text: string) => void
  onEscalate: () => void
  loading: boolean
  onBack: () => void
  userEmail: string
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.escalationHeader}>
          <Text style={styles.escalationTitle}>Email our support team</Text>
          <Text style={styles.escalationSubtitle}>
            We'll help you with this issue in detail
          </Text>
        </View>

        <View style={styles.escalationForm}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={onNameChange}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email || userEmail}
              onChangeText={onEmailChange}
              keyboardType="email-address"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Question</Text>
            <Text style={styles.questionContext}>{questionTitle}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Additional Details</Text>
            <TextInput
              style={[styles.input, styles.textAreaInput]}
              placeholder="Please describe your issue in detail..."
              value={description}
              onChangeText={onDescriptionChange}
              multiline
              numberOfLines={5}
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={onEscalate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Send to Support</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  greeting: {
    padding: 24,
    backgroundColor: '#F5F7FA',
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  categoriesGrid: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 24,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  categoryDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
  chevron: {
    marginLeft: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: Colors.primary.main,
    marginBottom: 16,
  },
  categoryHeaderIcon: {
    fontSize: 32,
  },
  categoryHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  questionsList: {
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.borderRadius.lg,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  questionIcon: {
    marginRight: 4,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  questionDivider: {
    height: 1,
    backgroundColor: Colors.ui.border,
    marginHorizontal: 16,
  },
  answerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  answerQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  answerContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  answerText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  answerActions: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.borderRadius.lg,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: DesignSystem.borderRadius.md,
  },
  ratingButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  escalateButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  escalateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  escalationHeader: {
    padding: 24,
  },
  escalationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  escalationSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  escalationForm: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text.primary,
  },
  textAreaInput: {
    height: 120,
    paddingTop: 12,
  },
  questionContext: {
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: DesignSystem.borderRadius.md,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
})
