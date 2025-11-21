import { Stack } from 'expo-router';

export default function MockExamLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="exam" />
    </Stack>
  );
}
