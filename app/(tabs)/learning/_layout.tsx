import { Stack } from 'expo-router';

export default function LearningLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="lesson" />
      <Stack.Screen name="lesson-viewer" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="quiz-results" />
      <Stack.Screen name="quiz-review" />
    </Stack>
  );
}
