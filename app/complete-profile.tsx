import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import { getProfile, updateUserProfile } from '@/api/profile'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'
import { Colors, DesignSystem } from '@/constants/DesignSystem'

type StepType = 1 | 2

interface FormData {
  full_name: string
  phone_number: string
  country_code: string
  date_of_birth: string
  gender: '' | 'male' | 'female' | 'other'
  current_country: string
  nmc_attempts: number | null
  uses_coaching: boolean | null
}

const steps: { id: StepType; label: string }[] = [
  { id: 1, label: 'Personal details' },
  { id: 2, label: 'Learning profile' },
]

const countryOptions = [
  'India',
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'United Arab Emirates',
  'Saudi Arabia',
  'Singapore',
  'Malaysia',
  'Philippines',
]

export default function CompleteProfileScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<StepType>(1)
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1))

  const [formData, setFormData] = useState<FormData>({
    full_name: user?.user_metadata?.full_name || '',
    phone_number: '',
    country_code: '+91',
    date_of_birth: '',
    gender: '',
    current_country: 'India',
    nmc_attempts: null,
    uses_coaching: null,
  })

  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return

      try {
        const profile = await getProfile(user.id)
        if (profile) {
          setFormData({
            full_name: profile.full_name || '',
            phone_number: profile.phone_number || '',
            country_code: profile.country_code || '+91',
            date_of_birth: profile.date_of_birth || '',
            gender: (profile.gender as FormData['gender']) || '',
            current_country: profile.current_country || 'India',
            nmc_attempts: profile.nmc_attempts ?? null,
            uses_coaching: profile.uses_coaching ?? null,
          })

          if (profile.date_of_birth) {
            const parts = profile.date_of_birth.split('/')
            if (parts.length === 3) {
              const [day, month, year] = parts
              setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)))
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoadingProfile(false)
      }
    }

    loadProfile()
  }, [user?.id])

  const validateStep1 = () => {
    const nextErrors: Record<string, string> = {}
    if (!formData.full_name.trim()) nextErrors.full_name = 'Full name is required'
    if (!formData.date_of_birth) nextErrors.date_of_birth = 'Date of birth is required'
    if (!formData.gender) nextErrors.gender = 'Gender is required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateStep2 = () => {
    const nextErrors: Record<string, string> = {}
    if (!formData.current_country) nextErrors.current_country = 'Country is required'
    if (formData.nmc_attempts === null) nextErrors.nmc_attempts = 'NMC attempts is required'
    if (formData.uses_coaching === null) nextErrors.uses_coaching = 'Please indicate coaching status'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleContinue = () => {
    if (validateStep1()) {
      setErrors({})
      setCurrentStep(2)
    }
  }

  const handleDateChange = (_event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios')
    if (date) {
      setSelectedDate(date)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      setFormData({ ...formData, date_of_birth: `${day}/${month}/${year}` })
      setErrors((prev) => ({ ...prev, date_of_birth: undefined }))
    }
  }

  const handleComplete = async () => {
    if (!validateStep2() || !user?.id) return

    setLoading(true)
    try {
      const auth_provider =
        (user?.app_metadata?.provider as 'email' | 'google' | 'apple') ||
        (user?.user_metadata?.provider as 'email' | 'google' | 'apple') ||
        'email'

      await updateUserProfile(user.id, {
        full_name: formData.full_name,
        phone_number: formData.phone_number || undefined,
        country_code: formData.country_code || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        gender: formData.gender || undefined,
        current_country: formData.current_country,
        nmc_attempts: formData.nmc_attempts ?? undefined,
        uses_coaching: formData.uses_coaching ?? undefined,
        auth_provider,
        profile_completed: true,
      })

      const onClose = () => router.replace('/(tabs)')
      if (Platform.OS === 'web') {
        alert('Profile updated successfully!')
        onClose()
      } else {
        Alert.alert('Success', 'Profile updated successfully!', [{ text: 'OK', onPress: onClose }])
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      const message = error?.message || 'Failed to update profile. Please try again.'
      if (Platform.OS === 'web') {
        alert(`Failed to update profile: ${message}`)
      } else {
        Alert.alert('Error', `Failed to update profile: ${message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const renderProgress = () => (
    <View style={styles.progressWrapper}>
      {steps.map((step, index) => {
        const isReached = currentStep >= step.id
        const isActive = currentStep === step.id
        return (
          <View key={step.id} style={styles.progressItem}>
            <View style={[styles.progressBadge, isReached && styles.progressBadgeActive]}>
              <Text style={[styles.progressBadgeText, isReached && styles.progressBadgeTextActive]}>
                {step.id}
              </Text>
            </View>
            <Text style={[styles.progressLabel, (isReached || isActive) && styles.progressLabelActive]}>
              {step.label}
            </Text>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.progressConnector,
                  currentStep > step.id && styles.progressConnectorActive,
                ]}
              />
            )}
          </View>
        )
      })}
    </View>
  )

  const renderStep1 = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Personal information</Text>
        <Text style={styles.sectionSubtitle}>
          Tell us who you are so we can personalise your experience.
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          Full name <Text style={styles.required}>*</Text>
        </Text>
        <Input
          value={formData.full_name}
          onChangeText={(text) => {
            setFormData({ ...formData, full_name: text })
            setErrors((prev) => ({ ...prev, full_name: undefined }))
          }}
          placeholder="Enter your full name"
          autoCapitalize="words"
          style={[styles.input, errors.full_name && styles.inputError]}
        />
        {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Phone number (optional)</Text>
        <View style={styles.phoneRow}>
          <Input
            value={formData.country_code}
            onChangeText={(text) => setFormData({ ...formData, country_code: text })}
            placeholder="+91"
            keyboardType="phone-pad"
            style={[styles.input, styles.countryCodeInput]}
          />
          <Input
            value={formData.phone_number}
            onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            style={[styles.input, styles.phoneInput]}
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          Date of birth <Text style={styles.required}>*</Text>
        </Text>
        <Pressable
          style={[styles.selector, errors.date_of_birth && styles.inputError]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={formData.date_of_birth ? styles.selectorValue : styles.selectorPlaceholder}>
            {formData.date_of_birth || 'Select date of birth'}
          </Text>
          <Ionicons name="calendar-outline" size={18} color={Colors.text.tertiary} />
        </Pressable>
        {errors.date_of_birth && <Text style={styles.errorText}>{errors.date_of_birth}</Text>}

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1950, 0, 1)}
          />
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          Gender <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.chipRow}>
          {[
            { key: 'male', label: 'Male' },
            { key: 'female', label: 'Female' },
            { key: 'other', label: 'Other' },
          ].map((option) => {
            const isSelected = formData.gender === option.key
            return (
              <Pressable
                key={option.key}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => {
                  setFormData({ ...formData, gender: option.key as FormData['gender'] })
                  setErrors((prev) => ({ ...prev, gender: undefined }))
                }}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{option.label}</Text>
              </Pressable>
            )
          })}
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
      </View>
    </View>
  )

  const renderStep2 = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Learning profile</Text>
        <Text style={styles.sectionSubtitle}>
          Tailor recommendations based on where you practise and your preparation status.
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          Current country of practice <Text style={styles.required}>*</Text>
        </Text>
        <Pressable style={styles.selector} onPress={() => setShowCountryPicker(true)}>
          <Text style={styles.selectorValue}>{formData.current_country}</Text>
          <Ionicons name="chevron-down" size={18} color={Colors.text.tertiary} />
        </Pressable>
        {errors.current_country && <Text style={styles.errorText}>{errors.current_country}</Text>}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          How many NMC CBT attempts have you taken? <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.chipRow}>
          {[0, 1, 2, 3].map((num) => {
            const isSelected = formData.nmc_attempts === num
            return (
              <Pressable
                key={num}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => {
                  setFormData({ ...formData, nmc_attempts: num })
                  setErrors((prev) => ({ ...prev, nmc_attempts: undefined }))
                }}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{num}</Text>
              </Pressable>
            )
          })}
        </View>
        <Text style={styles.helperText}>We use this to tune mock exam difficulty for you.</Text>
        {errors.nmc_attempts && <Text style={styles.errorText}>{errors.nmc_attempts}</Text>}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          Are you using coaching services? <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.chipRow}>
          {[{ key: false, label: 'No' }, { key: true, label: 'Yes' }].map((option) => {
            const isSelected = formData.uses_coaching === option.key
            return (
              <Pressable
                key={option.label}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => {
                  setFormData({ ...formData, uses_coaching: option.key })
                  setErrors((prev) => ({ ...prev, uses_coaching: undefined }))
                }}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{option.label}</Text>
              </Pressable>
            )
          })}
        </View>
        {errors.uses_coaching && <Text style={styles.errorText}>{errors.uses_coaching}</Text>}
      </View>
    </View>
  )

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {showCountryPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select country</Text>
              <Pressable onPress={() => setShowCountryPicker(false)}>
                <Ionicons name='close' size={22} color={Colors.text.primary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalList}>
              {countryOptions.map((country) => {
                const isSelected = formData.current_country === country
                return (
                  <Pressable
                    key={country}
                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                    onPress={() => {
                      setFormData({ ...formData, current_country: country })
                      setErrors((prev) => ({ ...prev, current_country: undefined }))
                      setShowCountryPicker(false)
                    }}
                  >
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                      {country}
                    </Text>
                    {isSelected && <Ionicons name='checkmark' size={18} color={Colors.primary.main} />}
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroIconBadge}>
              <Ionicons name='sparkles' size={20} color={Colors.text.inverse} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Complete your profile</Text>
              <Text style={styles.heroSubtitle}>
                Share a few details so we can tailor your roadmap, mock exams, and reminders.
              </Text>
            </View>
          </View>

          {renderProgress()}

          {currentStep === 1 ? renderStep1() : renderStep2()}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep === 1 ? (
            <Button title='Continue' onPress={handleContinue} style={styles.primaryButton} />
          ) : (
            <Button
              title={loading ? 'Saving…' : 'Complete profile'}
              onPress={handleComplete}
              loading={loading}
              disabled={loading}
              style={styles.primaryButton}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const colors = DesignSystem.colors
const spacing = DesignSystem.spacing
const radius = DesignSystem.borderRadius

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'] + spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.card,
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    gap: spacing.base,
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...DesignSystem.platformShadows.sm,
  },
  heroIconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: DesignSystem.typography.fontSize['2xl'],
    color: colors.text.primary,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: DesignSystem.typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: radius['2xl'],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...DesignSystem.platformShadows.sm,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  progressBadgeActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  progressBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: DesignSystem.typography.fontSize.md,
    color: colors.text.secondary,
  },
  progressBadgeTextActive: {
    color: colors.text.inverse,
  },
  progressLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: DesignSystem.typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: colors.text.primary,
  },
  progressConnector: {
    position: 'absolute',
    right: -spacing.base,
    top: 18,
    width: spacing['2xl'],
    height: 2,
    backgroundColor: colors.ui.border,
  },
  progressConnectorActive: {
    backgroundColor: colors.primary.main,
  },
  sectionCard: {
    backgroundColor: colors.background.card,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.ui.border,
    padding: spacing.lg,
    gap: spacing.lg,
    ...DesignSystem.platformShadows.sm,
  },
  sectionHeader: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: DesignSystem.typography.fontSize.lg,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: DesignSystem.typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: DesignSystem.typography.fontSize.sm,
    color: colors.text.primary,
  },
  required: {
    color: colors.semantic.error,
  },
  input: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.base,
    fontFamily: 'Inter_400Regular',
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: DesignSystem.typography.fontSize.sm,
    color: colors.semantic.error,
  },
  helperText: {
    fontFamily: 'Inter_400Regular',
    fontSize: DesignSystem.typography.fontSize.sm,
    color: colors.text.secondary,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countryCodeInput: {
    width: 80,
  },
  phoneInput: {
    flex: 1,
  },
  selector: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: DesignSystem.typography.fontSize.base,
    color: colors.text.primary,
  },
  selectorPlaceholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: DesignSystem.typography.fontSize.base,
    color: colors.text.tertiary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.ui.border,
    backgroundColor: colors.background.secondary,
  },
  chipSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.accent.lightBlue,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: DesignSystem.typography.fontSize.sm,
    color: colors.text.primary,
  },
  chipTextSelected: {
    color: colors.primary.dark,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.select({
      ios: spacing['2xl'],
      android: spacing.lg,
      default: spacing.lg,
    }),
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary.main,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
  },
  loadingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: DesignSystem.typography.fontSize.base,
    color: colors.text.secondary,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    zIndex: 100,
  },
  modalCard: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: colors.background.card,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...DesignSystem.platformShadows.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: DesignSystem.typography.fontSize.lg,
    color: colors.text.primary,
  },
  modalList: {
    maxHeight: 360,
  },
  modalOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  modalOptionSelected: {
    backgroundColor: colors.accent.lightBlue,
  },
  modalOptionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: DesignSystem.typography.fontSize.base,
    color: colors.text.primary,
  },
  modalOptionTextSelected: {
    color: colors.primary.main,
  },
})
