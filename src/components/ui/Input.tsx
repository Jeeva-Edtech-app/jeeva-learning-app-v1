import { useState } from 'react'
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  isPassword?: boolean
}

export const Input = ({ label, error, isPassword, ...props }: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholderTextColor="#9E9E9E"
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#9E9E9E"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF8A80',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#FF8A80',
    marginTop: 4,
  },
})
